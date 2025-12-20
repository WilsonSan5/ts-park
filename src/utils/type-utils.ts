/**
 * Type Utilities Index
 *
 * Centralized exports for all type-safe utility functions.
 * Import from this file to access error handling and type guards.
 *
 * @example
 * import { getErrorMessage, isString, isUUID } from '../utils/type-utils';
 */

// Re-export all error utilities
export {
  getErrorMessage,
  getErrorStack,
  isError,
  isAppError,
  isQueryFailedError,
  isJWTError,
  toErrorObject,
} from './error-utils';

// Re-export all type guards
export {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isArrayOf,
  isRecord,
  hasProperty,
  hasPropertyOfType,
  isNullish,
  isDefined,
  isValidDate,
  isUUID,
  isNonEmptyString,
  isPositiveNumber,
  isNonNegativeNumber,
  isEnumValue,
} from './type-guards';

// Re-export response helpers
export {
  sendSuccess,
  sendCreated,
  sendError,
} from './response';
