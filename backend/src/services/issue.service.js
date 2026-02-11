import Issue from '../models/Issue.model.js';
import CloudinaryService from './cloudinary.service.js';
import AppError from '../utils/AppError.js';
import {
    ISSUE_STATUS,
    ALLOWED_TRANSITIONS,
    RESOLVE_ROLES
} from '../config/constants.js';

/**
 * IssueService — Single Responsibility: all business logic for issue management.
 * Dependency Inversion: controller depends on this service, not Mongoose directly.
 * Open/Closed: status transitions are driven by the ALLOWED_TRANSITIONS config map.
 */
class IssueService {
    /**
     * Create a new issue report.
     * @param {object} issueData - { title, description, category, coordinates, address }
     * @param {string} userId - Reporter's user ID
     * @param {Array} files - Uploaded image files from multer
     * @returns {Promise<object>} Created issue document
     */
    static async createIssue(issueData, userId, files = []) {
        const { title, description, category, longitude, latitude, address } = issueData;

        // Extract uploaded image references
        const images = CloudinaryService.extractUploadedImages(files);

        const issue = await Issue.create({
            title,
            description,
            category,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
                address: address || ''
            },
            images,
            reporter: userId,
            statusHistory: [
                {
                    status: ISSUE_STATUS.PENDING,
                    changedBy: userId,
                    comment: 'Issue reported'
                }
            ]
        });

        return issue;
    }

    /**
     * Get a single issue by ID with populated references.
     * @param {string} issueId
     * @returns {Promise<object>} Issue document
     * @throws {AppError} If issue not found
     */
    static async getIssueById(issueId) {
        const issue = await Issue.findById(issueId)
            .populate('reporter', 'name email')
            .populate('statusHistory.changedBy', 'name')
            .populate('comments.user', 'name');

        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        return issue;
    }

    /**
     * Get paginated list of issues reported by a specific user.
     * @param {string} userId
     * @param {object} query - { page, limit, status, category }
     * @returns {Promise<object>} Paginated result
     */
    static async getUserIssues(userId, query = {}) {
        const { page = 1, limit = 10, status, category } = query;

        const filter = { reporter: userId };
        if (status) filter.status = status;
        if (category) filter.category = category;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: { path: 'reporter', select: 'name email' }
        };

        return Issue.paginate(filter, options);
    }

    /**
     * Get paginated public feed of active issues, with optional geo and category filters.
     * @param {object} query - { page, limit, category, latitude, longitude, radius }
     * @returns {Promise<object>} Paginated result
     */
    static async getPublicIssues(query = {}) {
        const { page = 1, limit = 10, category, latitude, longitude, radius } = query;

        // Only show active issues (not withdrawn)
        const filter = {
            status: { $ne: ISSUE_STATUS.WITHDRAWN }
        };

        if (category) filter.category = category;

        // Geo-filter: find issues near a given point within a radius (in meters)
        if (latitude && longitude) {
            const maxDistance = parseInt(radius) || 5000; // Default 5km radius
            filter.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: maxDistance
                }
            };
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: { path: 'reporter', select: 'name' },
            select: '-statusHistory' // Exclude audit trail from public feed
        };

        return Issue.paginate(filter, options);
    }

    /**
     * Update issue status with role-based validation.
     * Open/Closed Principle: transition rules come from ALLOWED_TRANSITIONS map.
     * @param {string} issueId
     * @param {string} newStatus - Target status
     * @param {string} userId - User making the change
     * @param {string} userRole - Role of the user
     * @param {string} comment - Optional comment
     * @returns {Promise<object>} Updated issue
     * @throws {AppError} If transition is invalid or user lacks permission
     */
    static async updateIssueStatus(issueId, newStatus, userId, userRole, comment = '') {
        const issue = await Issue.findById(issueId);
        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        // Check if transition is allowed (Open/Closed: config-driven)
        const allowedNext = ALLOWED_TRANSITIONS[issue.status];
        if (!allowedNext || !allowedNext.includes(newStatus)) {
            throw new AppError(
                `Cannot transition from "${issue.status}" to "${newStatus}"`,
                400
            );
        }

        // Role-based check: only admin/official can resolve
        if (newStatus === ISSUE_STATUS.RESOLVED && !RESOLVE_ROLES.includes(userRole)) {
            throw new AppError(
                'Only Admin or Official can mark an issue as Resolved',
                403
            );
        }

        // Update status and append to history
        issue.status = newStatus;
        issue.statusHistory.push({
            status: newStatus,
            changedBy: userId,
            comment
        });

        await issue.save();
        return issue;
    }

    /**
     * Add an official comment to an issue.
     * @param {string} issueId
     * @param {string} userId
     * @param {string} text
     * @returns {Promise<object>} Updated issue
     */
    static async addComment(issueId, userId, text) {
        const issue = await Issue.findById(issueId);
        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        issue.comments.push({
            user: userId,
            text
        });

        await issue.save();
        return issue;
    }

    /**
     * Withdraw an issue — only the original reporter can do this.
     * @param {string} issueId
     * @param {string} userId - Must match the reporter
     * @returns {Promise<object>} Updated issue
     */
    static async withdrawIssue(issueId, userId) {
        const issue = await Issue.findById(issueId);
        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        // Only the original reporter can withdraw
        if (issue.reporter.toString() !== userId) {
            throw new AppError('You can only withdraw your own reports', 403);
        }

        // Check if status allows withdrawal
        const allowedNext = ALLOWED_TRANSITIONS[issue.status];
        if (!allowedNext || !allowedNext.includes(ISSUE_STATUS.WITHDRAWN)) {
            throw new AppError(
                `Cannot withdraw an issue with status "${issue.status}"`,
                400
            );
        }

        issue.status = ISSUE_STATUS.WITHDRAWN;
        issue.statusHistory.push({
            status: ISSUE_STATUS.WITHDRAWN,
            changedBy: userId,
            comment: 'Issue withdrawn by reporter'
        });

        await issue.save();
        return issue;
    }

    /**
     * Delete an issue — reporter can delete their own, admin can delete any.
     * Also cleans up associated Cloudinary images.
     * @param {string} issueId
     * @param {string} userId
     * @param {string} userRole
     * @returns {Promise<object>} Deleted issue
     */
    static async deleteIssue(issueId, userId, userRole) {
        const issue = await Issue.findById(issueId);
        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        // Only reporter or admin can delete
        const isReporter = issue.reporter.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isReporter && !isAdmin) {
            throw new AppError('You are not authorized to delete this issue', 403);
        }

        // Clean up Cloudinary images
        if (issue.images && issue.images.length > 0) {
            const publicIds = issue.images.map((img) => img.publicId);
            await CloudinaryService.deleteImages(publicIds);
        }

        await Issue.findByIdAndDelete(issueId);
        return issue;
    }
}

export default IssueService;
