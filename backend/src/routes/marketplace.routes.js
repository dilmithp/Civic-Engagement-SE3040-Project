import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
    createListing,
    getAllListings,
    getListingById,
    updateListing,
    updateListingStatus,
    deleteListing
} from '../controllers/marketplace.controller.js';
import {
    createListingValidator,
    updateListingValidator,
    updateListingStatusValidator,
    listingIdValidator
} from '../validators/marketplace.validators.js';

const router = Router();

/**
 * Marketplace Routes
 */

// ─── Public Routes ───────────────────────────────────────────────
router.get('/', getAllListings);
router.get('/:id', listingIdValidator, validate, getListingById);

// ─── Authenticated Routes ────────────────────────────────────────
router.post('/', protect, createListingValidator, validate, createListing);
router.patch('/:id', protect, listingIdValidator, updateListingValidator, validate, updateListing);
router.patch('/:id/status', protect, listingIdValidator, updateListingStatusValidator, validate, updateListingStatus);
router.delete('/:id', protect, listingIdValidator, validate, deleteListing);

export default router;
