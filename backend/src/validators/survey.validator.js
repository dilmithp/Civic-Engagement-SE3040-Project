import { body } from 'express-validator';

export const createSurveyValidator = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 150 }).withMessage('Title max 150 characters'),

  body('description')
    .notEmpty().withMessage('Description is required'),

  body('options')
    .isArray({ min: 2 }).withMessage('At least 2 options required'),

  body('options.*.text')
    .notEmpty().withMessage('Each option must have text'),

  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Deadline must be a valid date')
    .custom((val) => {
      if (new Date(val) <= new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),

  body('targetAudience')
    .optional()
    .isIn(['all', 'citizen', 'official'])
    .withMessage('Invalid target audience'),

  body('isImportant')
    .optional()
    .isBoolean()
];

export const voteValidator = [
  body('selectedOptionIndex')
    .notEmpty().withMessage('Option index is required')
    .isInt({ min: 0 }).withMessage('Option index must be a non-negative integer')
];
