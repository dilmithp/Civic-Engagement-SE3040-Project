import Marketplace from '../models/Marketplace.model.js';
import CloudinaryService from './cloudinary.service.js';
import AppError from '../utils/AppError.js';

/**
 * Valid status transitions for marketplace listings.
 * Maps current status → allowed next statuses.
 */
const STATUS_TRANSITIONS = {
    available: ['reserved', 'sold', 'expired'],
    reserved: ['available', 'sold', 'expired'],
    sold: [],        // Final state — no further transitions allowed
    expired: []      // Final state — no further transitions allowed
};

/**
 * MarketplaceService — Business logic for the circular economy marketplace.
 */
class MarketplaceService {
    static normalizeImagesInput(value) {
        if (!value) return [];

        if (Array.isArray(value)) {
            return value.map((item) => String(item).trim()).filter(Boolean);
        }

        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) return [];

            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.map((item) => String(item).trim()).filter(Boolean);
                }
            } catch {
                // Fallback to comma-separated values
            }

            return trimmed
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        }

        return [];
    }

    /**
     * Create a new marketplace listing.
     * @param {object} data - Listing data from request body
     * @param {string} userId - Authenticated user's ID
     * @param {Array} files - Uploaded image files
     * @returns {Promise<object>} Created listing document
     */
    static async createListing(data, userId, files = []) {
        const { title, description, category, type, price, images, contactInfo, expiresAt } = data;
        const uploadedImages = CloudinaryService.extractUploadedImages(files).map((img) => img.url);
        const providedImages = this.normalizeImagesInput(images);
        const finalImages = [...providedImages, ...uploadedImages];

        if (finalImages.length > 5) {
            throw new AppError('You can upload up to 5 images per listing.', 400);
        }

        // Validate sale listings must have a price
        if (type === 'sale' && (price === undefined || price === null)) {
            throw new AppError('Price is required for sale listings. Please provide a valid price.', 400);
        }

        // Validate price is not set for donations
        if (type === 'donation' && price !== undefined && price !== null && price > 0) {
            throw new AppError('Donation listings cannot have a price. Set type to "sale" or remove the price.', 400);
        }

        // Validate expiry date is in the future
        if (expiresAt && new Date(expiresAt) <= new Date()) {
            throw new AppError('Expiry date must be in the future. Please provide a valid future date.', 400);
        }

        const listing = await Marketplace.create({
            title,
            description,
            category,
            type,
            price: type === 'sale' ? price : undefined,
            images: finalImages,
            contactInfo,
            expiresAt: expiresAt || undefined,
            owner: String(userId)
        });

        return listing;
    }

    /**
     * Get paginated list of marketplace listings with optional filters.
     * Automatically marks expired listings.
     * @param {object} queryParams - { page, limit, category, type, status }
     * @returns {Promise<object>} Paginated result
     */
    static async getAllListings(queryParams = {}) {
        const { page = 1, limit = 10, category, type, status, q } = queryParams;

        // Validate pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        if (isNaN(pageNum) || pageNum < 1) {
            throw new AppError('Invalid page number. Page must be a positive integer.', 400);
        }
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            throw new AppError('Invalid limit. Limit must be between 1 and 100.', 400);
        }

        // Validate type filter if provided
        if (type && !['donation', 'sale'].includes(type)) {
            throw new AppError(`Invalid type filter "${type}". Allowed values: donation, sale.`, 400);
        }

        // Validate status filter if provided
        if (status && !['available', 'reserved', 'sold', 'expired'].includes(status)) {
            throw new AppError(
                `Invalid status filter "${status}". Allowed values: available, reserved, sold, expired.`,
                400
            );
        }

        // Mark expired listings before querying
        await Marketplace.updateMany(
            { expiresAt: { $lt: new Date() }, status: { $ne: 'expired' } },
            { $set: { status: 'expired' } }
        );

        const filter = {};
        if (category) filter.category = category;
        if (type) filter.type = type;
        if (status) filter.status = status;
        if (q) {
            filter.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } }
            ];
        }

        const skip = (pageNum - 1) * limitNum;

        const [listings, total] = await Promise.all([
            Marketplace.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Marketplace.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limitNum);

        if (pageNum > totalPages && total > 0) {
            throw new AppError(
                `Page ${pageNum} does not exist. There are only ${totalPages} page(s) available.`,
                400
            );
        }

        return {
            listings,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages
        };
    }

    /**
     * Get listings owned by the authenticated user.
     * @param {string} userId
     * @param {object} queryParams - { page, limit, status }
     * @returns {Promise<object>} Paginated result
     */
    static async getMyListings(userId, queryParams = {}) {
        const { page = 1, limit = 10, status } = queryParams;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        if (isNaN(pageNum) || pageNum < 1) {
            throw new AppError('Invalid page number. Page must be a positive integer.', 400);
        }
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            throw new AppError('Invalid limit. Limit must be between 1 and 100.', 400);
        }

        if (status && !['available', 'reserved', 'sold', 'expired'].includes(status)) {
            throw new AppError(
                `Invalid status filter "${status}". Allowed values: available, reserved, sold, expired.`,
                400
            );
        }

        await Marketplace.updateMany(
            {
                owner: String(userId),
                expiresAt: { $lt: new Date() },
                status: { $ne: 'expired' }
            },
            { $set: { status: 'expired' } }
        );

        const filter = { owner: String(userId) };
        if (status) filter.status = status;

        const skip = (pageNum - 1) * limitNum;

        const [listings, total] = await Promise.all([
            Marketplace.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Marketplace.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limitNum);

        if (pageNum > totalPages && total > 0) {
            throw new AppError(
                `Page ${pageNum} does not exist. There are only ${totalPages} page(s) available.`,
                400
            );
        }

        return {
            listings,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages
        };
    }

    /**
     * Get a single listing by ID.
     * @param {string} id - Listing ID
     * @returns {Promise<object>} Listing document
     * @throws {AppError} If listing not found
     */
    static async getListingById(id) {
        // Mark as expired if past expiresAt
        await Marketplace.updateMany(
            { _id: id, expiresAt: { $lt: new Date() }, status: { $ne: 'expired' } },
            { $set: { status: 'expired' } }
        );

        const listing = await Marketplace.findById(id);

        if (!listing) {
            throw new AppError(`Marketplace listing with ID "${id}" was not found. It may have been deleted.`, 404);
        }

        return listing;
    }

    /**
     * Update a listing (owner or admin only).
     * @param {string} id - Listing ID
     * @param {object} updateData - Fields to update
     * @param {object} user - Authenticated user { id, role }
     * @param {Array} files - Uploaded image files
     * @returns {Promise<object>} Updated listing
     * @throws {AppError} If not found or not authorized
     */
    static async updateListing(id, updateData, user, files = []) {
        const listing = await Marketplace.findById(id);

        if (!listing) {
            throw new AppError(`Marketplace listing with ID "${id}" was not found. It may have been deleted.`, 404);
        }

        // Check if listing is expired or sold
        if (listing.status === 'expired') {
            throw new AppError('Cannot update an expired listing. Please create a new listing instead.', 400);
        }
        if (listing.status === 'sold') {
            throw new AppError('Cannot update a listing that has already been sold.', 400);
        }

        const userId = user.id || user._id;
        if (listing.owner.toString() !== String(userId) && user.role !== 'admin') {
            throw new AppError(
                'You are not authorized to update this listing. Only the listing owner or an admin can make changes.',
                403
            );
        }

        // Prevent updating restricted fields
        const { owner, status, ...allowedUpdates } = updateData;

        // Warn if user tried to change restricted fields
        if (updateData.owner) {
            throw new AppError('Cannot change the owner of a listing. This field is read-only.', 400);
        }
        if (updateData.status) {
            throw new AppError(
                'Cannot change status through this endpoint. Use PATCH /api/v1/marketplace/:id/status instead.',
                400
            );
        }

        // Validate type/price consistency on update
        const effectiveType = allowedUpdates.type || listing.type;
        if (effectiveType === 'sale' && allowedUpdates.price === undefined && !listing.price) {
            throw new AppError('Price is required when listing type is "sale". Please provide a price.', 400);
        }
        if (effectiveType === 'donation' && allowedUpdates.price !== undefined && allowedUpdates.price > 0) {
            throw new AppError('Donation listings cannot have a price. Set price to 0 or remove it.', 400);
        }

        if (effectiveType === 'donation') {
            allowedUpdates.price = undefined;
        }

        const uploadedImages = CloudinaryService.extractUploadedImages(files).map((img) => img.url);
        const hasImagesField = Object.prototype.hasOwnProperty.call(updateData, 'images');
        const hasExistingImagesField = Object.prototype.hasOwnProperty.call(updateData, 'existingImages');

        if (hasImagesField || hasExistingImagesField || uploadedImages.length > 0) {
            const baseImages = hasExistingImagesField
                ? this.normalizeImagesInput(updateData.existingImages)
                : hasImagesField
                    ? this.normalizeImagesInput(updateData.images)
                    : listing.images;

            const finalImages = [...baseImages, ...uploadedImages];

            if (finalImages.length > 5) {
                throw new AppError('You can upload up to 5 images per listing.', 400);
            }

            allowedUpdates.images = finalImages;
        }

        const updated = await Marketplace.findByIdAndUpdate(id, allowedUpdates, {
            new: true,
            runValidators: true
        });

        return updated;
    }

    /**
     * Update listing status (owner or admin only).
     * @param {string} id - Listing ID
     * @param {string} newStatus - New status value
     * @param {object} user - Authenticated user { id, role }
     * @returns {Promise<object>} Updated listing
     * @throws {AppError} If not found, not authorized, or invalid transition
     */
    static async updateListingStatus(id, newStatus, user) {
        if (!newStatus) {
            throw new AppError('Status is required. Allowed values: available, reserved, sold, expired.', 400);
        }

        const listing = await Marketplace.findById(id);

        if (!listing) {
            throw new AppError(`Marketplace listing with ID "${id}" was not found. It may have been deleted.`, 404);
        }

        const userId = user.id || user._id;
        if (listing.owner.toString() !== String(userId) && user.role !== 'admin') {
            throw new AppError(
                'You are not authorized to change the status of this listing. Only the listing owner or an admin can update status.',
                403
            );
        }

        // Validate status transition
        const currentStatus = listing.status;
        const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];

        if (currentStatus === newStatus) {
            throw new AppError(`Listing is already in "${currentStatus}" status. No change needed.`, 400);
        }

        if (!allowedTransitions.includes(newStatus)) {
            throw new AppError(
                `Cannot change status from "${currentStatus}" to "${newStatus}". ` +
                (allowedTransitions.length > 0
                    ? `Allowed transitions from "${currentStatus}": ${allowedTransitions.join(', ')}.`
                    : `Listings with "${currentStatus}" status cannot be changed.`),
                400
            );
        }

        listing.status = newStatus;
        await listing.save();

        return listing;
    }

    /**
     * Delete a listing (owner or admin only).
     * @param {string} id - Listing ID
     * @param {object} user - Authenticated user { id, role }
     * @returns {Promise<void>}
     * @throws {AppError} If not found or not authorized
     */
    static async deleteListing(id, user) {
        const listing = await Marketplace.findById(id);

        if (!listing) {
            throw new AppError(`Marketplace listing with ID "${id}" was not found. It may have already been deleted.`, 404);
        }

        const userId = user.id || user._id;
        if (listing.owner.toString() !== String(userId) && user.role !== 'admin') {
            throw new AppError(
                'You are not authorized to delete this listing. Only the listing owner or an admin can delete it.',
                403
            );
        }

        await Marketplace.findByIdAndDelete(id);
    }
}

export default MarketplaceService;
