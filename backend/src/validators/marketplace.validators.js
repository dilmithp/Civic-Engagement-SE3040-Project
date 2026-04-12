import { body, param } from 'express-validator';

const parseImageArrayLike = (value) => {
    if (value === undefined || value === null || value === '') return [];
    if (Array.isArray(value)) return value;

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            return value.split(',').map((item) => item.trim()).filter(Boolean);
        }
    }

    return null;
};

/**
 * Marketplace Validators — Input validation rules for marketplace listings.
 */

// Validate creating a new listing
export const createListingValidator = [
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
        .withMessage('Category is required'),

    body('type')
        .trim()
        .notEmpty()
        .withMessage('Listing type is required')
        .isIn(['donation', 'sale'])
        .withMessage('Type must be either donation or sale'),

    body('price')
        .if(body('type').equals('sale'))
        .notEmpty()
        .withMessage('Price is required for sale listings')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('contactInfo')
        .trim()
        .notEmpty()
        .withMessage('Contact info is required'),

    body('images')
        .optional()
        .custom((value) => {
            const parsed = parseImageArrayLike(value);
            if (!parsed) {
                throw new Error('Images must be an array');
            }

            if (parsed.length > 5) {
                throw new Error('You can upload up to 5 images per listing');
            }

            return true;
        }),

    body('expiresAt')
        .optional()
        .isISO8601()
        .withMessage('Expiry date must be a valid date')
];

// Validate updating a listing
export const updateListingValidator = [
    body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Title cannot be empty')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),

    body('description')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Description cannot be empty')
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),

    body('category')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Category cannot be empty'),

    body('type')
        .optional()
        .trim()
        .isIn(['donation', 'sale'])
        .withMessage('Type must be either donation or sale'),

    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('contactInfo')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Contact info cannot be empty'),

    body('images')
        .optional()
        .custom((value) => {
            const parsed = parseImageArrayLike(value);
            if (!parsed) {
                throw new Error('Images must be an array');
            }

            if (parsed.length > 5) {
                throw new Error('You can upload up to 5 images per listing');
            }

            return true;
        }),

    body('existingImages')
        .optional()
        .custom((value) => {
            const parsed = parseImageArrayLike(value);
            if (!parsed) {
                throw new Error('existingImages must be an array');
            }

            if (parsed.length > 5) {
                throw new Error('You can keep up to 5 images per listing');
            }

            return true;
        })
];

// Validate updating listing status
export const updateListingStatusValidator = [
    body('status')
        .trim()
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['available', 'reserved', 'sold', 'expired'])
        .withMessage('Status must be one of: available, reserved, sold, expired')
];

    export const respondToRequestValidator = [
        body('action')
        .trim()
        .notEmpty()
        .withMessage('Action is required')
        .isIn(['approve', 'reject'])
        .withMessage('Action must be either approve or reject')
    ];

// Validate listing ID parameter
export const listingIdValidator = [
    param('id')
        .isMongoId()
        .withMessage('Invalid listing ID')
];
