import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/response.js';

// @desc    Get all users (excluding current admin if desired, but good to see all)
// @route   GET /api/v1/admin/users
// @access  Private / Admin
export const getAllUsers = asyncHandler(async (req, res, next) => {
    // Optionally we could filter out the current user, but seeing all users is standard
    const users = await User.find({}).sort({ createdAt: -1 });

    sendSuccess(res, 200, users, 'Users retrieved successfully');
});

// @desc    Update a user's role
// @route   PATCH /api/v1/admin/users/:id/role
// @access  Private / Admin
export const updateUserRole = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'citizen', 'official', 'admin'].includes(role)) {
        return next(new AppError('Invalid role specified', 400));
    }

    if (id === req.user.id) {
         return next(new AppError('You cannot change your own role', 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        return next(new AppError('User not found', 404));
    }

    sendSuccess(res, 200, updatedUser, `User role updated to ${role}`);
});

// @desc    Delete a user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private / Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (id === req.user.id) {
         return next(new AppError('You cannot delete your own account', 400));
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
        return next(new AppError('User not found', 404));
    }

    sendSuccess(res, 200, null, 'User deleted successfully');
});
