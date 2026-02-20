import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
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
    // Verify with HS256 only — must match acquisitions signing algorithm
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });

    // Validate token has required fields from acquisitions JWT
    if (!decoded.id || !decoded.role) {
      return next(new AppError('Invalid token structure', 401));
    }

    // Coerce id to string for MongoDB compatibility
    req.user = {
      id: String(decoded.id),
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 401));
  }
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
