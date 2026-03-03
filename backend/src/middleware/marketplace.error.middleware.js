import AppError from '../utils/AppError.js';

/**
 * Marketplace-specific error handler middleware.
 * Transforms Mongoose and other database errors into user-friendly messages.
 * This middleware is mounted on the marketplace router only.
 */
export const marketplaceErrorHandler = (err, req, res, next) => {
    // ─── Mongoose CastError (invalid ObjectId, bad type cast) ────────
    if (err.name === 'CastError') {
        const field = err.path === '_id' ? 'listing ID' : err.path;
        const message = `Invalid ${field} format: "${err.value}". Please provide a valid ${field}.`;
        return next(new AppError(message, 400));
    }

    // ─── Mongoose ValidationError (schema-level validation failures) ─
    if (err.name === 'ValidationError') {
        const fieldErrors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message
        }));
        const summary = fieldErrors.map((e) => `${e.field}: ${e.message}`).join('; ');
        const appError = new AppError(`Validation failed — ${summary}`, 400);
        appError.fieldErrors = fieldErrors;
        return next(appError);
    }

    // ─── MongoDB Duplicate Key Error (code 11000) ────────────────────
    if (err.code === 11000 || err.code === 11001) {
        const duplicateField = Object.keys(err.keyValue || {}).join(', ') || 'field';
        const message = `A listing with this ${duplicateField} already exists.`;
        return next(new AppError(message, 409));
    }

    // ─── MongoDB Network / Connection Errors ─────────────────────────
    if (err.name === 'MongoNetworkError' || err.name === 'MongoServerError') {
        const message = 'A database error occurred while processing your marketplace request. Please try again later.';
        return next(new AppError(message, 503));
    }

    // ─── Pass through AppError and other errors unchanged ────────────
    next(err);
};
