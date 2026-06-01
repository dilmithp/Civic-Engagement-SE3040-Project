import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { uploadMarketplace } from '../config/cloudinary.config.js';
import { marketplaceErrorHandler } from '../middleware/marketplace.error.middleware.js';
import {
    createListing,
    getAllListings,
    getMyListings,
    getListingById,
    updateListing,
    updateListingStatus,
    requestListing,
    cancelListingRequest,
    respondToListingRequest,
    deleteListing
} from '../controllers/marketplace.controller.js';
import {
    createListingValidator,
    updateListingValidator,
    updateListingStatusValidator,
    respondToRequestValidator,
    listingIdValidator
} from '../validators/marketplace.validators.js';

const router = Router();

/**
 * Marketplace Routes
 */

// ─── Public Routes ───────────────────────────────────────────────
router.get('/', getAllListings);

// ─── Authenticated Routes ────────────────────────────────────────
router.get('/mine', protect, getMyListings);
router.post('/', protect, uploadMarketplace.array('images', 5), createListingValidator, validate, createListing);
router.patch('/:id', protect, uploadMarketplace.array('images', 5), listingIdValidator, updateListingValidator, validate, updateListing);
router.patch('/:id/status', protect, listingIdValidator, updateListingStatusValidator, validate, updateListingStatus);
router.patch('/:id/request', protect, listingIdValidator, validate, requestListing);
router.patch('/:id/request/cancel', protect, listingIdValidator, validate, cancelListingRequest);
router.patch('/:id/request/respond', protect, listingIdValidator, respondToRequestValidator, validate, respondToListingRequest);
router.delete('/:id', protect, listingIdValidator, validate, deleteListing);

router.get('/:id', listingIdValidator, validate, getListingById);

// ─── Marketplace-specific Error Handler ──────────────────────────
// Catches Mongoose/DB errors from marketplace routes and converts
// them into user-friendly error responses before the global handler.
router.use(marketplaceErrorHandler);

export default router;
