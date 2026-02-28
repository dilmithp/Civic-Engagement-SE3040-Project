import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// Helper: sign a JWT
const signToken = (payload) =>
    jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return next(new AppError('Name, email and password are required', 400));
    }

    const exists = await User.findOne({ email });
    if (exists) {
        return next(new AppError('Email already in use', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        ...(role && { role }),
    });

    const token = signToken({ id: user._id, email: user.email, role: user.role });

    res.status(201).json({
        message: 'Registration successful',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Email and password are required', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('Invalid email or password', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new AppError('Invalid email or password', 401));
    }

    const token = signToken({ id: user._id, email: user.email, role: user.role });

    // Response shape matches the provided API contract exactly
    res.status(200).json({
        message: 'Login successful',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    });
});

// @desc    Get currently authenticated user
// @route   GET /api/v1/auth/me
// @access  Protected
export const getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        message: 'User fetched successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});
