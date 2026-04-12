import Survey from '../models/survey.model.js';
import SurveyResponse from '../models/surveyResponse.model.js';
import AppError from '../utils/AppError.js';
import { sendNewSurveyNotification } from '../utils/mailer.js';
import axios from 'axios';

// Create a new survey
export const createSurvey = async (data, userId, authHeader) => {
  const survey = await Survey.create({
    ...data,
    createdBy: userId
  });

  // Asynchronously query auth service to grab recipients and email them
  if (authHeader) {
    // We do not await this block so it doesn't slow down the HTTP response
    (async () => {
      try {
        const usersRes = await axios.get('https://auth.civic.dilmith.live/api/users', {
          headers: { Authorization: authHeader }
        });
        
        const users = usersRes.data?.users || usersRes.data?.data || [];
        const emailsToSend = [];

        for (const user of users) {
          if (!user.email) continue;
          // Send if audience is 'all' OR if the user's role matches the target audience
          if (data.targetAudience === 'all' || user.role === data.targetAudience) {
            emailsToSend.push(user.email);
          }
        }

        if (emailsToSend.length > 0) {
           await sendNewSurveyNotification(emailsToSend, survey.title, survey._id);
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'test') {
          console.error('[SurveyService] Failed to scatter emails to target audience:', err.message);
        }
      }
    })();
  }

  return survey;
};

// Get all active surveys (not expired, not closed)
export const getActiveSurveys = async (userRole, userId) => {
  const now = new Date();

  await Survey.updateMany(
    { deadline: { $lt: now }, status: 'active' },
    { status: 'expired' }
  );

  const query = {
    $or: [
      { targetAudience: 'all' },
      { targetAudience: userRole }
    ]
  };

  const surveys = await Survey.find(query).sort({ createdAt: -1 });

  // Map over the surveys to inject hasVoted
  if (!userId) return surveys;

  const surveyResponses = await SurveyResponse.find({ userId });
  const votedMap = new Map(surveyResponses.map(r => [r.surveyId.toString(), r.selectedOptionIndex]));

  return surveys.map(s => {
    const surveyObj = s.toObject();
    const votedIndex = votedMap.get(s._id.toString());
    surveyObj.hasVoted = votedIndex !== undefined;
    surveyObj.userVotedOptionIndex = votedIndex ?? null;
    return surveyObj;
  });
};

// Get single survey by ID
export const getSurveyById = async (surveyId) => {
  const survey = await Survey.findById(surveyId);
  if (!survey) throw new AppError('Survey not found', 404);
  return survey;
};

// Vote on a survey
export const voteOnSurvey = async (surveyId, userId, selectedOptionIndex) => {
  const survey = await Survey.findById(surveyId);

  if (!survey) throw new AppError('Survey not found', 404);
  if (survey.status !== 'active') throw new AppError('This survey is no longer active', 400);
  if (new Date() > survey.deadline) throw new AppError('Survey deadline has passed', 400);
  if (selectedOptionIndex < 0 || selectedOptionIndex >= survey.options.length) {
    throw new AppError('Invalid option selected', 400);
  }

  const existingResponse = await SurveyResponse.findOne({ surveyId, userId });

  if (existingResponse) {
    // Update existing vote
    const oldIndex = existingResponse.selectedOptionIndex;
    survey.options[oldIndex].voteCount -= 1;
    survey.options[selectedOptionIndex].voteCount += 1;
    existingResponse.selectedOptionIndex = selectedOptionIndex;
    await existingResponse.save();
  } else {
    // New vote
    await SurveyResponse.create({ surveyId, userId, selectedOptionIndex });
    survey.options[selectedOptionIndex].voteCount += 1;
    survey.totalVotes += 1;
  }

  await survey.save();
  return survey;
};

// Update survey (admin/official only)
export const updateSurvey = async (surveyId, updateData) => {
  const survey = await Survey.findByIdAndUpdate(
    surveyId,
    updateData,
    { new: true, runValidators: true }
  );
  if (!survey) throw new AppError('Survey not found', 404);
  return survey;
};

// Delete/close survey
export const deleteSurvey = async (surveyId) => {
  const survey = await Survey.findByIdAndUpdate(
    surveyId,
    { status: 'closed' },
    { new: true }
  );
  if (!survey) throw new AppError('Survey not found', 404);
  return survey;
};

// Get survey results formatted for Chart.js
export const getSurveyResults = async (surveyId) => {
  const survey = await Survey.findById(surveyId);
  if (!survey) throw new AppError('Survey not found', 404);

  const total = survey.totalVotes || 1;

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
    }))
  };
};
