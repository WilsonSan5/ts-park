import { AppError } from '../middleware/error.middleware';

/**
 * Safely extracts error message from unknown error types
 * Handles Error objects, AppError instances, and unknown values
 *
 * @param error - Unknown error value from catch block
 * @returns String representation of the error message
 *
 * @example
 * try {
 *   await someOperation();
 * } catch (error: unknown) {
 *   const message = getErrorMessage(error);
 *   logger.error(message);
 * }
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (isErrorWithMessage(error)) {
    return error.message;
  }

  return 'An unknown error occurred';
}

/**
 * Type guard to check if value is a standard Error object
 *
 * @param value - Value to check
 * @returns Type predicate indicating if value is Error
 *
 * @example
 * if (isError(error)) {
 *   console.log(error.stack);
 * }
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if value is an AppError instance
 * Used to handle application-specific errors with status codes
 *
 * @param value - Value to check
 * @returns Type predicate indicating if value is AppError
 *
 * @example
 * if (isAppError(error)) {
 *   res.status(error.statusCode).json({ message: error.message });
 * }
 */
export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

/**
 * Type guard to check if object has a message property
 * Useful for error-like objects that aren't Error instances
 *
 * @param value - Value to check
 * @returns Type predicate for objects with message property
 */
function isErrorWithMessage(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as Record<string, unknown>).message === 'string'
  );
}

/**
 * Extracts stack trace from error if available
 * Returns undefined if no stack trace exists
 *
 * @param error - Unknown error value
 * @returns Stack trace string or undefined
 *
 * @example
 * const stack = getErrorStack(error);
 * if (stack && process.env.NODE_ENV !== 'production') {
 *   console.error(stack);
 * }
 */
export function getErrorStack(error: unknown): string | undefined {
  if (isError(error)) {
    return error.stack;
  }
  return undefined;
}

/**
 * Safely converts error to JSON-serializable object
 * Useful for logging and API responses
 *
 * @param error - Unknown error value
 * @returns Plain object with error details
 *
 * @example
 * const errorObj = toErrorObject(error);
 * logger.error(JSON.stringify(errorObj));
 */
export function toErrorObject(error: unknown): {
  message: string;
  name?: string;
  stack?: string;
  statusCode?: number;
} {
  const message = getErrorMessage(error);
  const result: ReturnType<typeof toErrorObject> = { message };

  if (isError(error)) {
    result.name = error.name;
    result.stack = error.stack;
  }

  if (isAppError(error)) {
    result.statusCode = error.statusCode;
  }

  return result;
}

/**
 * Type guard to check if error is a TypeORM QueryFailedError
 * Useful for handling database-specific errors
 *
 * @param error - Unknown error value
 * @returns Type predicate for QueryFailedError
 *
 * @example
 * if (isQueryFailedError(error)) {
 *   // Handle database constraint violations
 * }
 */
export function isQueryFailedError(error: unknown): error is Error & { name: 'QueryFailedError' } {
  return isError(error) && error.name === 'QueryFailedError';
}

/**
 * Type guard to check if error is a JWT-related error
 * Handles both invalid tokens and expired tokens
 *
 * @param error - Unknown error value
 * @returns Type predicate for JWT errors
 *
 * @example
 * if (isJWTError(error)) {
 *   return res.status(401).json({ message: 'Authentication failed' });
 * }
 */
export function isJWTError(error: unknown): error is Error & { name: 'JsonWebTokenError' | 'TokenExpiredError' } {
  return isError(error) && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError');
}
