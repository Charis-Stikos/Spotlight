import { ApiError } from '../utils/ApiError.js';
import { isDev } from '../config/env.js';

// 404 — αν δεν ταίριαξε καμία διαδρομή
export function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Κεντρικός error handler — πρέπει να είναι τελευταίος και να κρατά και τα 4 ορίσματα
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;

  const body = {
    error: {
      message: err.isOperational ? err.message : 'Internal server error',
    },
  };
  if (err.details) body.error.details = err.details;

  if (statusCode >= 500) {
    console.error(err);
    if (isDev) body.error.stack = err.stack; // stack μόνο σε development
  }

  res.status(statusCode).json(body);
}
