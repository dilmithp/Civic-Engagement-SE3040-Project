import * as SurveyService from '../services/survey.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const createSurvey = asyncHandler(async (req, res) => {
  const survey = await SurveyService.createSurvey(req.body, req.user.id);
  sendSuccess(res, 201, survey, 'Survey created successfully');
});

export const getActiveSurveys = asyncHandler(async (req, res) => {
  // req.user.role is a string from the acquisitions JWT (citizen/official/admin)
  const userRole = req.user.role;
  const surveys = await SurveyService.getActiveSurveys(userRole);
  sendSuccess(res, 200, surveys, 'Active surveys fetched');
});

export const getSurveyById = asyncHandler(async (req, res) => {
  const survey = await SurveyService.getSurveyById(req.params.id);
  sendSuccess(res, 200, survey, 'Survey fetched');
});

export const voteOnSurvey = asyncHandler(async (req, res) => {
  const { selectedOptionIndex } = req.body;
  const survey = await SurveyService.voteOnSurvey(
    req.params.id,
    req.user.id,
    selectedOptionIndex
  );
  sendSuccess(res, 200, survey, 'Vote recorded successfully');
});

export const updateSurvey = asyncHandler(async (req, res) => {
  const survey = await SurveyService.updateSurvey(req.params.id, req.body);
  sendSuccess(res, 200, survey, 'Survey updated successfully');
});

export const deleteSurvey = asyncHandler(async (req, res) => {
  const survey = await SurveyService.deleteSurvey(req.params.id);
  sendSuccess(res, 200, survey, 'Survey closed successfully');
});

export const getSurveyResults = asyncHandler(async (req, res) => {
  const results = await SurveyService.getSurveyResults(req.params.id);
  sendSuccess(res, 200, results, 'Survey results fetched');
});
