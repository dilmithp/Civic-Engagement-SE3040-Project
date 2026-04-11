import { jest } from '@jest/globals';
import { getActiveSurveys, getSurveyById, createSurvey } from '../../../src/controllers/survey.controller.js';
import * as SurveyService from '../../../src/services/survey.service.js';

// Mock the dependencies
jest.unstable_mockModule('../../../src/services/survey.service.js', () => ({
  getActiveSurveys: jest.fn(),
  getSurveyById: jest.fn(),
  createSurvey: jest.fn()
}));

// Mock the response utility to prevent Express crashes
jest.mock('../../../src/utils/response.js', () => ({
  sendSuccess: jest.fn((res, statusCode, data, message) => {
    res.status(statusCode).json({ status: 'success', data, message });
  })
}));

describe('Survey Controller Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      user: { id: 'user123', role: 'citizen' },
      params: {},
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getActiveSurveys', () => {
    it('should successfully fetch active surveys for the users role', async () => {
      // Setup mock data
      const mockSurveys = [
        { _id: '1', title: 'Park Renovation', status: 'active', targetAudience: 'all' }
      ];
      
      // We manually override the imported module since we're using ESM proxy mocking
      jest.spyOn(SurveyService, 'getActiveSurveys').mockResolvedValue(mockSurveys);

      // Execute controller
      await getActiveSurveys(mockReq, mockRes, mockNext);

      // Verify Service called correctly
      expect(SurveyService.getActiveSurveys).toHaveBeenCalledWith('citizen');
      
      // Verify Express Response
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockSurveys,
        message: 'Active surveys fetched'
      });
    });
  });

  describe('getSurveyById', () => {
    it('should fetch a single survey by ID', async () => {
      mockReq.params.id = 'survey_999';
      const mockSurvey = { _id: 'survey_999', title: 'Library Hours' };
      
      jest.spyOn(SurveyService, 'getSurveyById').mockResolvedValue(mockSurvey);

      await getSurveyById(mockReq, mockRes, mockNext);

      expect(SurveyService.getSurveyById).toHaveBeenCalledWith('survey_999');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockSurvey,
        message: 'Survey fetched'
      });
    });
  });

  describe('createSurvey', () => {
    it('should allow officials to create surveys', async () => {
      mockReq.user.role = 'official';
      mockReq.body = { title: 'New Road Expansion', category: 'Infrastructure' };
      const createdObj = { _id: 'new1', ...mockReq.body };
      
      jest.spyOn(SurveyService, 'createSurvey').mockResolvedValue(createdObj);

      await createSurvey(mockReq, mockRes, mockNext);

      expect(SurveyService.createSurvey).toHaveBeenCalledWith(mockReq.body, 'user123');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: createdObj,
        message: 'Survey created successfully'
      });
    });
  });
});
