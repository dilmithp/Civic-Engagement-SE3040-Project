import Marketplace from '../models/Marketplace.model.js';
import AppError from '../utils/AppError.js';

/**
 * MarketplaceService — Business logic for the circular economy marketplace.
 */
class MarketplaceService {
    /**
     * Create a new marketplace listing.
     * @param {object} data - Listing data from request body
     * @param {string} userId - Authenticated user's ID
     * @returns {Promise<object>} Created listing document
     */
    static async createListing(data, userId) {
        const { title, description, category, type, price, images, contactInfo, expiresAt } = data;

        const listing = await Marketplace.create({
            title,
            description,
            category,
            type,
            price: type === 'sale' ? price : undefined,
            images: images || [],
            contactInfo,
            expiresAt: expiresAt || undefined,
            owner: userId
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
        const { page = 1, limit = 10, category, type, status } = queryParams;

        // Mark expired listings before querying
        await Marketplace.updateMany(
            { expiresAt: { $lt: new Date() }, status: { $ne: 'expired' } },
            { $set: { status: 'expired' } }
        );

        const filter = {};
        if (category) filter.category = category;
        if (type) filter.type = type;
        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [listings, total] = await Promise.all([
            Marketplace.find(filter)
                .populate('owner', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Marketplace.countDocuments(filter)
        ]);

        return {
            listings,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
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

        const listing = await Marketplace.findById(id).populate('owner', 'name email');

        if (!listing) {
            throw new AppError('Listing not found', 404);
        }

        return listing;
    }

    /**
     * Update a listing (owner or admin only).
     * @param {string} id - Listing ID
     * @param {object} updateData - Fields to update
     * @param {object} user - Authenticated user { id, role }
     * @returns {Promise<object>} Updated listing
     * @throws {AppError} If not found or not authorized
     */
    static async updateListing(id, updateData, user) {
        const listing = await Marketplace.findById(id);

        if (!listing) {
            throw new AppError('Listing not found', 404);
        }

        const userId = user.id || user._id;
        if (listing.owner.toString() !== userId && user.role !== 'admin') {
            throw new AppError('You are not authorized to update this listing', 403);
        }

        // Prevent updating restricted fields
        const { owner, status, ...allowedUpdates } = updateData;

        const updated = await Marketplace.findByIdAndUpdate(id, allowedUpdates, {
            new: true,
            runValidators: true
        }).populate('owner', 'name email');

        return updated;
    }

    /**
     * Update listing status (owner or admin only).
     * @param {string} id - Listing ID
     * @param {string} status - New status value
     * @param {object} user - Authenticated user { id, role }
     * @returns {Promise<object>} Updated listing
     * @throws {AppError} If not found or not authorized
     */
    static async updateListingStatus(id, status, user) {
        const listing = await Marketplace.findById(id);

        if (!listing) {
            throw new AppError('Listing not found', 404);
        }

        const userId = user.id || user._id;
        if (listing.owner.toString() !== userId && user.role !== 'admin') {
            throw new AppError('You are not authorized to change the status of this listing', 403);
        }

        listing.status = status;
        await listing.save();

        await listing.populate('owner', 'name email');

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
            throw new AppError('Listing not found', 404);
        }

        const userId = user.id || user._id;
        if (listing.owner.toString() !== userId && user.role !== 'admin') {
            throw new AppError('You are not authorized to delete this listing', 403);
        }

        await Marketplace.findByIdAndDelete(id);
    }
}

export default MarketplaceService;
