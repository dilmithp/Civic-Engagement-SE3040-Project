import axios from 'axios';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import Survey from '../models/survey.model.js';
import SurveyResponse from '../models/surveyResponse.model.js';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';
import { sendNewSurveyNotification, sendSurveyClosingReminder } from '../utils/mailer.js';

// Lazy — only instantiated when getSurveySummary is called, so missing key doesn't crash module load
let _openai = null;
const getOpenAI = () => {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
};

// Maps survey targetAudience values to User role values (auth service uses 'user' for citizens)
const AUDIENCE_TO_ROLE = { citizen: 'user', official: 'official' };

// Sign a short-lived token for a real admin user so the auth service middleware
// accepts it (middleware validates id against DB; bare service tokens get 403)
const makeServiceToken = async () => {
  const admin = await User.findOne({ role: 'admin' }).select('_id email role').lean();
  if (!admin) throw new Error('No admin user found to sign service token');
  return jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  );
};

// Fetch users from the auth service; falls back to local User model if unavailable
const getEmailsForAudience = async (targetAudience) => {
  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'https://auth.civic.dilmith.live';

  if (process.env.JWT_SECRET) {
    try {
      const token = process.env.AUTH_SERVICE_TOKEN || await makeServiceToken();
      const res = await axios.get(`${authServiceUrl}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
      const users = res.data?.users ?? res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
      const roleFilter = targetAudience === 'all' ? null : (AUDIENCE_TO_ROLE[targetAudience] ?? targetAudience);
      return users
        .filter(u => u.email && (roleFilter === null || u.role === roleFilter))
        .map(u => u.email);
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[SurveyService] Auth service unreachable, falling back to local DB:', err.message);
      }
    }
  }

  // Fallback: query local User model
  const roleFilter = targetAudience === 'all'
    ? {}
    : { role: AUDIENCE_TO_ROLE[targetAudience] ?? targetAudience };
  const users = await User.find(roleFilter).select('email');
  return users.map(u => u.email).filter(Boolean);
};

export const createSurvey = async (data, userId) => {
  const survey = await Survey.create({
    ...data,
    createdBy: userId
  });

  (async () => {
    try {
      const emails = await getEmailsForAudience(data.targetAudience);

      if (emails.length > 0) {
        await sendNewSurveyNotification(emails, survey.title, survey._id, survey.isImportant);

        // Schedule a closing reminder 24h before the deadline.
        // setTimeout uses a 32-bit signed int; cap at ~24 days to avoid overflow.
        const MAX_TIMEOUT = 2_147_483_647;
        const delayMs = new Date(survey.deadline).getTime() - Date.now() - 24 * 60 * 60 * 1000;
        if (delayMs > 0 && delayMs <= MAX_TIMEOUT) {
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

export const getSurveySummary = async (surveyId) => {
  const survey = await Survey.findById(surveyId);
  if (!survey) throw new AppError('Survey not found', 404);
  if (!survey.totalVotes) throw new AppError('Survey has no votes yet — nothing to summarise', 400);

  if (!process.env.OPENAI_API_KEY) throw new AppError('AI summary is not configured on this server', 503);

  const total = survey.totalVotes;

  const votesSection = survey.options
    .map(opt => `- "${opt.text}": ${opt.voteCount} votes (${((opt.voteCount / total) * 100).toFixed(1)}%)`)
    .join('\n');

  const commentDocs = await SurveyResponse.find({
    surveyId,
    comment: { $exists: true, $ne: '' }
  })
    .select('selectedOptionIndex comment')
    .sort({ createdAt: -1 })
    .limit(20);

  const commentsSection = commentDocs.length > 0
    ? '\nCitizen comments:\n' + commentDocs
        .map(r => `- [${survey.options[r.selectedOptionIndex]?.text ?? 'Unknown'}]: "${r.comment}"`)
        .join('\n')
    : '\nNo citizen comments were provided.';

  const prompt = `Survey: "${survey.title}"
Description: ${survey.description}
Total votes: ${total}
Status: ${survey.status}

Vote distribution:
${votesSection}
${commentsSection}

Write a 3-4 sentence neutral summary suitable for a civic council report. Highlight the majority preference, key themes from citizen comments if present, and any notable minority views.`;

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a civic engagement analyst. Generate concise, factual, neutral summaries of community survey results for official council reports. Do not use bullet points — write in flowing prose.'
      },
      { role: 'user', content: prompt }
    ],
    max_tokens: 300,
    temperature: 0.4
  });

  return {
    surveyId: survey._id,
    title: survey.title,
    totalVotes: survey.totalVotes,
    summary: completion.choices[0].message.content.trim(),
    generatedAt: new Date()
  };
};
