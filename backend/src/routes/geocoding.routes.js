import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { reverseGeocode, forwardGeocode } from '../controllers/geocoding.controller.js';

const router = Router();

/**
 * Geocoding Routes — Public endpoints for coordinate ↔ address conversion.
 */

// Reverse geocode: coordinates → address
router.get(
    '/reverse',
    [
        query('lat')
            .notEmpty().withMessage('Latitude is required')
            .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
        query('lng')
            .notEmpty().withMessage('Longitude is required')
            .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180')
    ],
    validate,
    reverseGeocode
);

// Forward geocode: address → coordinates
router.get(
    '/forward',
    [
        query('address')
            .notEmpty().withMessage('Address is required')
            .isLength({ min: 2, max: 300 }).withMessage('Address must be 2-300 characters')
    ],
    validate,
    forwardGeocode
);

export default router;
