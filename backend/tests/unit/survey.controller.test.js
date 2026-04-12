/**
 * UNIT TESTS — Survey Controller
 * Uses jest.mock() (CJS-compatible via babel-jest) to mock all dependencies.
 */

// Mock dependencies BEFORE importing controller (jest.mock is hoisted by Babel)
jest.mock('../../src/services/survey.service.js', () => ({
  getActiveSurveys: jest.fn(),
  getSurveyById: jest.fn(),
  createSurvey: jest.fn(),
  voteOnSurvey: jest.fn(),
  updateSurvey: jest.fn(),
  deleteSurvey: jest.fn(),
  getSurveyResults: jest.fn(),
}));

jest.mock('../../src/utils/response.js', () => ({
  sendSuccess: jest.fn((res, statusCode, data, message) => {
    res.status(statusCode).json({ status: 'success', data, message });
  }),
}));

jest.mock('../../src/utils/asyncHandler.js', () => ({
  asyncHandler: jest.fn((fn) => fn),
}));

import { getActiveSurveys, getSurveyById, createSurvey } from '../../src/controllers/survey.controller.js';
import * as SurveyService from '../../src/services/survey.service.js';

describe('Survey Controller — Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      user: { id: 'user123', role: 'citizen' },
      params: {},
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  // ── getActiveSurveys ─────────────────────────────────────────────────────
  describe('getActiveSurveys', () => {
    it('should successfully fetch active surveys for the user role', async () => {
      const mockSurveys = [
        { _id: '1', title: 'Park Renovation', status: 'active', targetAudience: 'all', hasVoted: false },
      ];

      SurveyService.getActiveSurveys.mockResolvedValue(mockSurveys);

      await getActiveSurveys(mockReq, mockRes, mockNext);

      expect(SurveyService.getActiveSurveys).toHaveBeenCalledWith('citizen', 'user123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockSurveys,
        message: 'Active surveys fetched',
      });
    });
  });

  // ── getSurveyById ────────────────────────────────────────────────────────
  describe('getSurveyById', () => {
    it('should fetch a single survey by ID', async () => {
      mockReq.params.id = 'survey_999';
      const mockSurvey = { _id: 'survey_999', title: 'Library Hours' };

      SurveyService.getSurveyById.mockResolvedValue(mockSurvey);

      await getSurveyById(mockReq, mockRes, mockNext);

      expect(SurveyService.getSurveyById).toHaveBeenCalledWith('survey_999');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockSurvey,
        message: 'Survey fetched',
      });
    });
  });

  // ── createSurvey ─────────────────────────────────────────────────────────
  describe('createSurvey', () => {
    it('should allow officials to create surveys', async () => {
      mockReq.user.role = 'official';
      mockReq.body = { title: 'New Road Expansion', category: 'Infrastructure' };
      const createdObj = { _id: 'new1', ...mockReq.body };

      SurveyService.createSurvey.mockResolvedValue(createdObj);

      await createSurvey(mockReq, mockRes, mockNext);

      expect(SurveyService.createSurvey).toHaveBeenCalledWith(mockReq.body, 'user123');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: createdObj,
        message: 'Survey created successfully',
      });
    });
  });
});
