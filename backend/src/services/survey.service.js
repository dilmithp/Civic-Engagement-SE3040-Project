import Survey from '../models/survey.model.js';
import SurveyResponse from '../models/surveyResponse.model.js';
import AppError from '../utils/AppError.js';
import { sendNewSurveyNotification, sendSurveyClosingReminder } from '../utils/mailer.js';
import axios from 'axios';

export const createSurvey = async (data, userId, authHeader) => {
  const survey = await Survey.create({
    ...data,
    createdBy: userId
  });

  if (authHeader) {
    (async () => {
      try {
        const usersRes = await axios.get('https://auth.civic.dilmith.live/api/users', {
          headers: { Authorization: authHeader }
        });

        const users = usersRes.data?.users || usersRes.data?.data || [];
        const emails = users
          .filter(u => u.email && (data.targetAudience === 'all' || u.role === data.targetAudience))
          .map(u => u.email);

        if (emails.length > 0) {
          await sendNewSurveyNotification(emails, survey.title, survey._id, survey.isImportant);

          // Schedule a closing reminder 24h before the deadline
          const delayMs = new Date(survey.deadline).getTime() - Date.now() - 24 * 60 * 60 * 1000;
          if (delayMs > 0) {
            setTimeout(async () => {
              try {
                await sendSurveyClosingReminder(emails, survey.title, survey.deadline);
              } catch (reminderErr) {
                if (process.env.NODE_ENV !== 'test') {
                  console.error('[SurveyService] Failed to send closing reminder:', reminderErr.message);
                }
              }
            }, delayMs);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'test') {
          console.error('[SurveyService] Failed to send survey notification emails:', err.message);
        }
      }
    })();
  }

  return survey;
};

export const getActiveSurveys = async (userRole, userId, page = 1, limit = 10) => {
  const now = new Date();

  await Survey.updateMany(
    { deadline: { $lt: now }, status: 'active' },
    { status: 'expired' }
  );

  const query = {
    status: { $ne: 'expired' },
    $or: [
      { targetAudience: 'all' },
      { targetAudience: userRole }
    ]
  };

  const result = await Survey.paginate(query, {
    page,
    limit,
    sort: { createdAt: -1 }
  });

  if (!userId || result.docs.length === 0) return result;

  const surveyIds = result.docs.map(s => s._id);
  const responses = await SurveyResponse.find({ userId, surveyId: { $in: surveyIds } });
  const votedMap = new Map(responses.map(r => [r.surveyId.toString(), r.selectedOptionIndex]));

  result.docs = result.docs.map(s => {
    const obj = s.toObject();
    const votedIndex = votedMap.get(s._id.toString());
    obj.hasVoted = votedIndex !== undefined;
    obj.userVotedOptionIndex = votedIndex ?? null;
    return obj;
  });

  return result;
};

export const getSurveyById = async (surveyId) => {
  const survey = await Survey.findById(surveyId);
  if (!survey) throw new AppError('Survey not found', 404);
  return survey;
};

export const voteOnSurvey = async (surveyId, userId, selectedOptionIndex, comment) => {
  const survey = await Survey.findById(surveyId).select('status deadline options');
  if (!survey) throw new AppError('Survey not found', 404);
  if (survey.status !== 'active') throw new AppError('This survey is no longer active', 400);
  if (new Date() > survey.deadline) throw new AppError('Survey deadline has passed', 400);
  if (selectedOptionIndex < 0 || selectedOptionIndex >= survey.options.length) {
    throw new AppError('Invalid option selected', 400);
  }

  const commentUpdate = comment?.trim() ? { comment: comment.trim() } : {};

  // Upsert the response; new: false returns the old doc, null if this is a new insert
  const prevResponse = await SurveyResponse.findOneAndUpdate(
    { surveyId, userId },
    { $set: { selectedOptionIndex, ...commentUpdate }, $setOnInsert: { surveyId, userId } },
    { new: false, upsert: true }
  );

  if (prevResponse) {
    const oldIndex = prevResponse.selectedOptionIndex;
    if (oldIndex === selectedOptionIndex) return survey;
    // Atomically shift vote counts — no separate save needed
    return Survey.findByIdAndUpdate(
      surveyId,
      {
        $inc: {
          [`options.${oldIndex}.voteCount`]: -1,
          [`options.${selectedOptionIndex}.voteCount`]: 1
        }
      },
      { new: true }
    );
  }

  // New vote — atomically increment count and total
  return Survey.findByIdAndUpdate(
    surveyId,
    {
      $inc: {
        [`options.${selectedOptionIndex}.voteCount`]: 1,
        totalVotes: 1
      }
    },
    { new: true }
  );
};

export const updateSurvey = async (surveyId, updateData) => {
  const survey = await Survey.findByIdAndUpdate(
    surveyId,
    updateData,
    { new: true, runValidators: true }
  );
  if (!survey) throw new AppError('Survey not found', 404);
  return survey;
};

export const deleteSurvey = async (surveyId) => {
  const survey = await Survey.findByIdAndUpdate(
    surveyId,
    { status: 'closed' },
    { new: true }
  );
  if (!survey) throw new AppError('Survey not found', 404);
  return survey;
};

export const getSurveyResults = async (surveyId) => {
  const survey = await Survey.findById(surveyId);
  if (!survey) throw new AppError('Survey not found', 404);

  const total = survey.totalVotes || 1;

  const commentDocs = await SurveyResponse.find({
    surveyId,
    comment: { $exists: true, $ne: '' }
  })
    .select('selectedOptionIndex comment createdAt')
    .sort({ createdAt: -1 })
    .limit(50);

  return {
    surveyId: survey._id,
    title: survey.title,
    status: survey.status,
    totalVotes: survey.totalVotes,
    chartData: {
      labels: survey.options.map((opt) => opt.text),
      datasets: [
        {
          label: 'Votes',
          data: survey.options.map((opt) => opt.voteCount),
          backgroundColor: [
            '#4caf50', '#2196f3', '#ff9800',
            '#e91e63', '#9c27b0', '#00bcd4'
          ]
        }
      ]
    },
    percentages: survey.options.map((opt) => ({
      option: opt.text,
      votes: opt.voteCount,
      percentage: ((opt.voteCount / total) * 100).toFixed(1)
    })),
    comments: commentDocs.map(r => ({
      optionText: survey.options[r.selectedOptionIndex]?.text ?? '',
      optionIndex: r.selectedOptionIndex,
      comment: r.comment,
      createdAt: r.createdAt
    }))
  };
};

export const exportSurveyResults = async (surveyId) => {
  const survey = await Survey.findById(surveyId);
  if (!survey) throw new AppError('Survey not found', 404);

  const total = survey.totalVotes || 1;

  const rows = [
    ['Survey Title', `"${survey.title.replace(/"/g, '""')}"`],
    ['Total Votes', survey.totalVotes],
    ['Status', survey.status],
    ['Deadline', new Date(survey.deadline).toLocaleDateString()],
    [],
    ['Option', 'Votes', 'Percentage']
  ];

  survey.options.forEach(opt => {
    rows.push([
      `"${opt.text.replace(/"/g, '""')}"`,
      opt.voteCount,
      `${((opt.voteCount / total) * 100).toFixed(1)}%`
    ]);
  });

  const commentDocs = await SurveyResponse.find({
    surveyId,
    comment: { $exists: true, $ne: '' }
  })
    .select('selectedOptionIndex comment createdAt')
    .sort({ createdAt: -1 });

  if (commentDocs.length > 0) {
    rows.push([], ['Citizen Comments'], ['Option', 'Comment', 'Date']);
    commentDocs.forEach(r => {
      const optText = survey.options[r.selectedOptionIndex]?.text ?? '';
      rows.push([
        `"${optText.replace(/"/g, '""')}"`,
        `"${(r.comment || '').replace(/"/g, '""')}"`,
        new Date(r.createdAt).toLocaleDateString()
      ]);
    });
  }

  return {
    csv: rows.map(r => r.join(',')).join('\n'),
    filename: `survey-${survey.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-results.csv`
  };
};
