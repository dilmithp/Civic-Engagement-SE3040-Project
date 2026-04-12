import express from 'express';
import { getAllUsers, updateUserRole, deleteUser } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply middleware to all routes in this router
router.use(protect);
router.use(authorize('admin'));

// --- User Management Routes ---
router.route('/users')
    .get(getAllUsers);

router.route('/users/:id/role')
    .patch(updateUserRole);

router.route('/users/:id')
    .delete(deleteUser);


export default router;
