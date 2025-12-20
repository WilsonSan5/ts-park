import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for application errors with status codes
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

/**
 * 400 Bad Request / Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

/**
 * 409 Conflict error
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

/**
 * Centralized error handling middleware
 * Must be registered LAST in the middleware chain
 */
export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging (in production, use a proper logger)
  console.error(`[Error] ${new Date().toISOString()} - ${req.method} ${req.path}:`);
  console.error(`  Message: ${error.message}`);

  // Only log stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`  Stack: ${error.stack}`);
  }

  // Handle known operational errors (AppError instances)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Handle TypeORM specific errors
  if (error.name === 'QueryFailedError') {
    // Don't expose database error details in production
    const message = process.env.NODE_ENV === 'production'
      ? 'Database operation failed'
      : error.message;

    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired',
    });
  }

  // Handle validation errors from express-validator or similar
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // Handle generic errors (thrown with new Error('message'))
  // Map common error messages to appropriate status codes
  const errorMessage = error.message.toLowerCase();

  if (errorMessage.includes('not found')) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }

  if (
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('invalid token') ||
    errorMessage.includes('token has been revoked')
  ) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }

  if (
    errorMessage.includes('permission') ||
    errorMessage.includes('access denied') ||
    errorMessage.includes('only') // e.g., "Only super administrators can..."
  ) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }

  if (
    errorMessage.includes('already') ||
    errorMessage.includes('duplicate') ||
    errorMessage.includes('exists')
  ) {
    return res.status(409).json({
      success: false,
      message: error.message,
    });
  }

  if (
    errorMessage.includes('invalid') ||
    errorMessage.includes('required') ||
    errorMessage.includes('must be') ||
    errorMessage.includes('cannot be')
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // Default: Internal server error
  // In production, don't expose internal error details
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message || 'Internal server error',
  });
};

/**
 * 404 handler for undefined routes
 * Register BEFORE errorMiddleware
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.method} ${req.path}`);
  next(error);
};
