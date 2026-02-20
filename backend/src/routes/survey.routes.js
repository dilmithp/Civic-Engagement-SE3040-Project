import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { ROLES } from '../config/constants.js';
import {
  createSurveyValidator,
  voteValidator
} from '../validators/survey.validator.js';
import {
  createSurvey,
  getActiveSurveys,
  getSurveyById,
  voteOnSurvey,
  updateSurvey,
  deleteSurvey,
  getSurveyResults
} from '../controllers/survey.controller.js';

const router = Router();

// Admin/Official: Create survey
router.post(
  '/',
  protect,
  authorize(ROLES.ADMIN, ROLES.OFFICIAL),
  createSurveyValidator,
  validate,
  createSurvey
);

// All authenticated users: Get active surveys
router.get(
  '/active',
  protect,
  authorize(ROLES.ADMIN, ROLES.OFFICIAL, ROLES.CITIZEN),
  getActiveSurveys
);

// All authenticated users: Get single survey
router.get(
  '/:id',
  protect,
  authorize(ROLES.ADMIN, ROLES.OFFICIAL, ROLES.CITIZEN),
  getSurveyById
);

// All authenticated users: Get survey results for Chart.js
router.get(
  '/:id/results',
  protect,
  authorize(ROLES.ADMIN, ROLES.OFFICIAL, ROLES.CITIZEN),
  getSurveyResults
);

// All authenticated users: Vote
router.patch(
  '/:id/vote',
  protect,
  authorize(ROLES.CITIZEN, ROLES.ADMIN, ROLES.OFFICIAL),
  voteValidator,
  validate,
  voteOnSurvey
);

// Admin/Official: Update survey
router.put(
  '/:id',
  protect,
  authorize(ROLES.ADMIN, ROLES.OFFICIAL),
  updateSurvey
);

// Admin/Official: Close/delete survey
router.delete(
  '/:id',
  protect,
  authorize(ROLES.ADMIN, ROLES.OFFICIAL),
  deleteSurvey
);

export default router;
