import MarketplaceService from '../services/marketplace.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

/**
 * MarketplaceController — HTTP request/response handling only.
 * Delegates all business logic to MarketplaceService.
 */

/**
 * @desc    Create a new marketplace listing
 * @route   POST /api/marketplace
 * @access  Private (authenticated users)
 */
export const createListing = asyncHandler(async (req, res) => {
    const listing = await MarketplaceService.createListing(req.body, req.user.id);

    sendSuccess(res, 201, listing, 'Listing created successfully');
});

/**
 * @desc    Get all marketplace listings (with filters and pagination)
 * @route   GET /api/marketplace
 * @access  Public
 */
export const getAllListings = asyncHandler(async (req, res) => {
    const result = await MarketplaceService.getAllListings(req.query);

    sendSuccess(res, 200, result, 'Listings retrieved successfully');
});

/**
 * @desc    Get a single marketplace listing by ID
 * @route   GET /api/marketplace/:id
 * @access  Public
 */
export const getListingById = asyncHandler(async (req, res) => {
    const listing = await MarketplaceService.getListingById(req.params.id);

    sendSuccess(res, 200, listing, 'Listing retrieved successfully');
});

/**
 * @desc    Update a marketplace listing
 * @route   PATCH /api/marketplace/:id
 * @access  Private (owner or admin)
 */
export const updateListing = asyncHandler(async (req, res) => {
    const listing = await MarketplaceService.updateListing(
        req.params.id,
        req.body,
        req.user
    );

    sendSuccess(res, 200, listing, 'Listing updated successfully');
});

/**
 * @desc    Update listing status
 * @route   PATCH /api/marketplace/:id/status
 * @access  Private (owner or admin)
 */
export const updateListingStatus = asyncHandler(async (req, res) => {
    const listing = await MarketplaceService.updateListingStatus(
        req.params.id,
        req.body.status,
        req.user
    );

    sendSuccess(res, 200, listing, 'Listing status updated successfully');
});

/**
 * @desc    Delete a marketplace listing
 * @route   DELETE /api/marketplace/:id
 * @access  Private (owner or admin)
 */
export const deleteListing = asyncHandler(async (req, res) => {
    await MarketplaceService.deleteListing(req.params.id, req.user);

    sendSuccess(res, 200, null, 'Listing deleted successfully');
});
