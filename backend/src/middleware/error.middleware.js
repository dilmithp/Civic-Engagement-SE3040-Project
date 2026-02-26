import { NODE_ENV } from '../config/env.js';

export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // return clean JSON
  const response = {
    status,
    message: err.message || 'Something went wrong'
  };

  // In development, add the stack trace as a separate field (opt-in, not embedded in error object)
  if (NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Non-operational errors in production (unexpected bugs) → hide details
  if (NODE_ENV === 'production' && !err.isOperational) {
    response.message = 'Internal server error';
  }

  res.status(statusCode).json(response);
};
