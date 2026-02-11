import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { upload } from '../config/cloudinary.config.js';
import {
    createIssue,
    getMyIssues,
    getPublicIssues,
    getIssueById,
    updateStatus,
    addComment,
    withdrawIssue,
    deleteIssue
} from '../controllers/issue.controller.js';
import {
    createIssueValidator,
    updateStatusValidator,
    addCommentValidator,
    getPublicIssuesValidator,
    issueIdValidator
} from '../validators/issue.validators.js';

const router = Router();

/**
 * Issue Routes — Interface Segregation Principle:
 * Routes are grouped by access level so each group only uses the middleware it needs.
 */

// ─── Public Routes (no auth required) ────────────────────────────
router.get('/', getPublicIssuesValidator, validate, getPublicIssues);

// ─── Authenticated User Routes ───────────────────────────────────
// Note: /my-issues MUST come before /:id to avoid Express matching "my-issues" as an :id param
router.get('/my-issues', protect, getMyIssues);

// ─── Public single issue (placed after /my-issues to avoid conflict) ─
router.get('/:id', issueIdValidator, validate, getIssueById);

// All routes below require authentication
router.use(protect);

router.post(
    '/',
    upload.array('images', 5),
    createIssueValidator,
    validate,
    createIssue
);

router.patch(
    '/:id/withdraw',
    issueIdValidator,
    validate,
    withdrawIssue
);

router.delete(
    '/:id',
    issueIdValidator,
    validate,
    deleteIssue
);

// ─── Admin / Official Routes ─────────────────────────────────────
router.patch(
    '/:id/status',
    authorize('admin', 'official'),
    updateStatusValidator,
    validate,
    updateStatus
);

router.post(
    '/:id/comments',
    authorize('admin', 'official'),
    addCommentValidator,
    validate,
    addComment
);

export default router;
