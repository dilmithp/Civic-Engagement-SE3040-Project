import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
    // ==========================================
    // TEMPORARY BYPASS FOR TESTING CRUD IN POSTMAN
    // ==========================================
    // This mocks a logged-in user so you can test POST/PUT/DELETE
    // without needing a real JWT token.
    req.user = {
        id: '65d3a1b2c3d4e5f6a7b8c9d0', // Fake MongoDB ObjectId
        role: 'user'
    };
    return next();
    // ==========================================


    /* --- ACTUAL AUTH LOGIC (Commented out for now) ---
    let token;

    // Check Authorization header first (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Fallback: check httpOnly cookie (matches acquisitions service)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return next(new AppError('Not authorized to access this route', 401));
    }
    --------------------------------------------------- */
});

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(`User role '${req.user.role}' is not authorized to access this route`, 403)
            );
        }
        next();
    };
};