import { body, param, query } from 'express-validator';
import { ISSUE_CATEGORIES, ISSUE_STATUS } from '../config/constants.js';

/**
 * Issue Validators — Single Responsibility: input validation rules only.
 * Separated from controller/service to keep each layer focused.
 */

// Validate creating a new issue
export const createIssueValidator = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),

    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required')
        .isIn(ISSUE_CATEGORIES)
        .withMessage(`Category must be one of: ${ISSUE_CATEGORIES.join(', ')}`),

    body('longitude')
        .notEmpty()
        .withMessage('Longitude is required')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),

    body('latitude')
        .notEmpty()
        .withMessage('Latitude is required')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage('Address cannot exceed 300 characters')
];

// Validate updating issue status
export const updateStatusValidator = [
    param('id')
        .isMongoId()
        .withMessage('Invalid issue ID'),

    body('status')
        .trim()
        .notEmpty()
        .withMessage('Status is required')
        .isIn(Object.values(ISSUE_STATUS))
        .withMessage(`Status must be one of: ${Object.values(ISSUE_STATUS).join(', ')}`),

    body('comment')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Comment cannot exceed 500 characters')
];

// Validate adding a comment
export const addCommentValidator = [
    param('id')
        .isMongoId()
        .withMessage('Invalid issue ID'),

    body('text')
        .trim()
        .notEmpty()
        .withMessage('Comment text is required')
        .isLength({ max: 500 })
        .withMessage('Comment cannot exceed 500 characters')
];

// Validate getting public issues (query params)
export const getPublicIssuesValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),

    query('category')
        .optional()
        .isIn(ISSUE_CATEGORIES)
        .withMessage(`Category must be one of: ${ISSUE_CATEGORIES.join(', ')}`),

    query('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),

    query('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),

    query('radius')
        .optional()
        .isInt({ min: 100, max: 50000 })
        .withMessage('Radius must be between 100 and 50000 meters')
];

// Validate issue ID param
export const issueIdValidator = [
    param('id')
        .isMongoId()
        .withMessage('Invalid issue ID')
];
