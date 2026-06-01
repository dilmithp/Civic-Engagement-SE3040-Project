import MarketplaceService from '../services/marketplace.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import AppError from '../utils/AppError.js';

/**
 * MarketplaceController — HTTP request/response handling only.
 * Delegates all business logic to MarketplaceService.
 */

/**
 * @desc    Create a new marketplace listing
 * @route   POST /api/v1/marketplace
 * @access  Private (authenticated users)
 */
export const createListing = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    if (!userId) {
        throw new AppError(
            'Authentication error: Unable to identify user. Please log in again.',
            401
        );
    }

    const listing = await MarketplaceService.createListing(req.body, userId, req.files || []);

    sendSuccess(res, 201, listing, 'Listing created successfully');
});

/**
 * @desc    Get all marketplace listings (with filters and pagination)
 * @route   GET /api/v1/marketplace
 * @access  Public
 */
export const getAllListings = asyncHandler(async (req, res) => {
    const result = await MarketplaceService.getAllListings(req.query);

    sendSuccess(res, 200, result, 'Listings retrieved successfully');
});

/**
 * @desc    Get marketplace listings owned by the logged-in user
 * @route   GET /api/v1/marketplace/mine
 * @access  Private
 */
export const getMyListings = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    if (!userId) {
        throw new AppError('Authentication error: Unable to identify user. Please log in again.', 401);
    }

    const result = await MarketplaceService.getMyListings(userId, req.query);

    sendSuccess(res, 200, result, 'Your listings retrieved successfully');
});

/**
 * @desc    Get a single marketplace listing by ID
 * @route   GET /api/v1/marketplace/:id
 * @access  Public
 */
export const getListingById = asyncHandler(async (req, res) => {
    const listing = await MarketplaceService.getListingById(req.params.id);

    sendSuccess(res, 200, listing, 'Listing retrieved successfully');
});

/**
 * @desc    Update a marketplace listing
 * @route   PATCH /api/v1/marketplace/:id
 * @access  Private (owner or admin)
 */
export const updateListing = asyncHandler(async (req, res) => {
    const hasBody = req.body && Object.keys(req.body).length > 0;
    const hasFiles = Array.isArray(req.files) && req.files.length > 0;

    if (!hasBody && !hasFiles) {
        throw new AppError(
            'No update data provided. Please include at least one field to update (title, description, category, type, price, contactInfo, images).',
            400
        );
    }

    const listing = await MarketplaceService.updateListing(
        req.params.id,
        req.body,
        req.user,
        req.files || []
    );

    sendSuccess(res, 200, listing, 'Listing updated successfully');
});

/**
 * @desc    Update listing status
 * @route   PATCH /api/v1/marketplace/:id/status
 * @access  Private (owner or admin)
 */
export const updateListingStatus = asyncHandler(async (req, res) => {
    if (!req.body.status) {
        throw new AppError(
            'Status field is required. Allowed values: available, reserved, sold, expired.',
            400
        );
    }

    const listing = await MarketplaceService.updateListingStatus(
        req.params.id,
        req.body.status,
        req.user
    );

    sendSuccess(res, 200, listing, 'Listing status updated successfully');
});

/**
 * @desc    Submit request for a marketplace listing
 * @route   PATCH /api/v1/marketplace/:id/request
 * @access  Private
 */
export const requestListing = asyncHandler(async (req, res) => {
    const listing = await MarketplaceService.requestListing(req.params.id, req.user);

    sendSuccess(res, 200, listing, 'Request submitted successfully');
});

/**
 * @desc    Cancel currently pending request for a listing
 * @route   PATCH /api/v1/marketplace/:id/request/cancel
 * @access  Private
 */
export const cancelListingRequest = asyncHandler(async (req, res) => {
    const listing = await MarketplaceService.cancelListingRequest(req.params.id, req.user);

    sendSuccess(res, 200, listing, 'Request canceled successfully');
});

/**
 * @desc    Owner/admin responds to pending listing request
 * @route   PATCH /api/v1/marketplace/:id/request/respond
 * @access  Private (owner or admin)
 */
export const respondToListingRequest = asyncHandler(async (req, res) => {
    const listing = await MarketplaceService.respondToListingRequest(req.params.id, req.body.action, req.user);

    sendSuccess(res, 200, listing, `Request ${req.body.action}d successfully`);
});

/**
 * @desc    Delete a marketplace listing
 * @route   DELETE /api/v1/marketplace/:id
 * @access  Private (owner or admin)
 */
export const deleteListing = asyncHandler(async (req, res) => {
    await MarketplaceService.deleteListing(req.params.id, req.user);

    sendSuccess(res, 200, null, 'Listing deleted successfully');
});
