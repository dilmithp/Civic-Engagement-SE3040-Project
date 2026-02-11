import IssueService from '../services/issue.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

/**
 * IssueController — Single Responsibility: HTTP request/response handling only.
 * Dependency Inversion: delegates all business logic to IssueService.
 */

/**
 * @desc    Create a new issue report
 * @route   POST /api/v1/issues
 * @access  Private (authenticated users)
 */
export const createIssue = asyncHandler(async (req, res) => {
    const issue = await IssueService.createIssue(
        req.body,
        req.user.id,
        req.files || []
    );

    sendSuccess(res, 201, issue, 'Issue reported successfully');
});

/**
 * @desc    Get current user's issue reports
 * @route   GET /api/v1/issues/my-issues
 * @access  Private (authenticated users)
 */
export const getMyIssues = asyncHandler(async (req, res) => {
    const result = await IssueService.getUserIssues(req.user.id, req.query);

    sendSuccess(res, 200, result, 'User issues retrieved successfully');
});

/**
 * @desc    Get public feed of all active issues
 * @route   GET /api/v1/issues
 * @access  Public
 */
export const getPublicIssues = asyncHandler(async (req, res) => {
    const result = await IssueService.getPublicIssues(req.query);

    sendSuccess(res, 200, result, 'Public issues retrieved successfully');
});

/**
 * @desc    Get a single issue by ID
 * @route   GET /api/v1/issues/:id
 * @access  Public
 */
export const getIssueById = asyncHandler(async (req, res) => {
    const issue = await IssueService.getIssueById(req.params.id);

    sendSuccess(res, 200, issue, 'Issue retrieved successfully');
});

/**
 * @desc    Update issue status (admin/official only)
 * @route   PATCH /api/v1/issues/:id/status
 * @access  Private (admin, official)
 */
export const updateStatus = asyncHandler(async (req, res) => {
    const { status, comment } = req.body;

    const issue = await IssueService.updateIssueStatus(
        req.params.id,
        status,
        req.user.id,
        req.user.role,
        comment
    );

    sendSuccess(res, 200, issue, 'Issue status updated successfully');
});

/**
 * @desc    Add a comment to an issue
 * @route   POST /api/v1/issues/:id/comments
 * @access  Private (admin, official)
 */
export const addComment = asyncHandler(async (req, res) => {
    const issue = await IssueService.addComment(
        req.params.id,
        req.user.id,
        req.body.text
    );

    sendSuccess(res, 200, issue, 'Comment added successfully');
});

/**
 * @desc    Withdraw an issue (reporter only)
 * @route   PATCH /api/v1/issues/:id/withdraw
 * @access  Private (original reporter)
 */
export const withdrawIssue = asyncHandler(async (req, res) => {
    const issue = await IssueService.withdrawIssue(req.params.id, req.user.id);

    sendSuccess(res, 200, issue, 'Issue withdrawn successfully');
});

/**
 * @desc    Delete an issue
 * @route   DELETE /api/v1/issues/:id
 * @access  Private (reporter or admin)
 */
export const deleteIssue = asyncHandler(async (req, res) => {
    await IssueService.deleteIssue(req.params.id, req.user.id, req.user.role);

    sendSuccess(res, 200, null, 'Issue deleted successfully');
});
