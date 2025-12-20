import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { sendError } from '../utils/response';
import { getErrorMessage } from '../utils/error-utils';

/**
 * DTO Validation Source Types
 * Determines which part of the request to validate
 */
export enum ValidationSource {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
}

/**
 * Validation Middleware Factory
 *
 * Creates Express middleware that validates request data against a DTO class
 * using class-validator decorators.
 *
 * Features:
 * - Automatic type transformation from plain objects to class instances
 * - Comprehensive validation using class-validator decorators
 * - Strips unknown properties for security (whitelist mode)
 * - Detailed error messages with field-level validation feedback
 * - Supports validation of body, query params, and route params
 *
 * @param dtoClass - The DTO class with class-validator decorators
 * @param source - Which part of request to validate (body/query/params)
 * @param skipMissingProperties - Skip validation of properties not present in DTO
 * @returns Express middleware function
 *
 * @example
 * // In route definition:
 * router.post('/register', validateDTO(RegisterDTO), authController.register);
 * router.get('/users', validateDTO(PaginationDTO, ValidationSource.QUERY), userController.list);
 */
export const validateDTO = <T extends object>(
  dtoClass: ClassConstructor<T>,
  source: ValidationSource = ValidationSource.BODY,
  skipMissingProperties: boolean = false
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get data from appropriate request source
      const data = req[source];

      // Transform plain object to class instance
      // whitelist: strip properties not in DTO (security)
      // forbidNonWhitelisted: throw error if unknown properties present
      const dtoInstance = plainToInstance(dtoClass, data, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true,
      });

      // Validate the DTO instance
      const errors: ValidationError[] = await validate(dtoInstance, {
        skipMissingProperties,
        whitelist: true, // Strip properties without decorators
        forbidNonWhitelisted: false, // Don't throw error for extra props, just strip them
        validationError: {
          target: false, // Don't include target object in error
          value: false, // Don't include validated value in error (security)
        },
      });

      // If validation errors exist, format and return them
      if (errors.length > 0) {
        const formattedErrors = formatValidationErrors(errors);
        return sendError(
          res,
          'Validation failed',
          400,
          formattedErrors
        );
      }

      // Replace request data with validated and transformed DTO instance
      // This ensures type safety throughout the application
      // Note: req.query is read-only in Express, so we skip reassignment for query params
      // The validation has passed at this point, so controllers can safely use req.query
      if (source !== ValidationSource.QUERY) {
        req[source] = dtoInstance;
      }

      next();
    } catch (error: unknown) {
      return sendError(res, `Validation error: ${getErrorMessage(error)}`, 500);
    }
  };
};

/**
 * Formats class-validator errors into a user-friendly structure
 *
 * @param errors - Array of ValidationError from class-validator
 * @returns Object mapping field names to error message arrays
 *
 * @example
 * // Returns:
 * {
 *   email: ['Email must be a valid email address', 'Email is required'],
 *   password: ['Password must be at least 8 characters long']
 * }
 */
function formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};

  errors.forEach((error) => {
    // Get the property name (e.g., 'email', 'password')
    const property = error.property;

    // Extract all constraint messages for this property
    if (error.constraints) {
      formattedErrors[property] = Object.values(error.constraints);
    }

    // Handle nested validation errors (for nested objects)
    if (error.children && error.children.length > 0) {
      const nestedErrors = formatValidationErrors(error.children);
      Object.keys(nestedErrors).forEach((nestedProperty) => {
        const fullPath = `${property}.${nestedProperty}`;
        formattedErrors[fullPath] = nestedErrors[nestedProperty];
      });
    }
  });

  return formattedErrors;
}

/**
 * Optional: Middleware to validate route parameters (common use case)
 * Validates UUID parameters in routes
 *
 * @param paramName - Name of the route parameter to validate
 * @returns Express middleware function
 *
 * @example
 * router.get('/users/:id', validateUUIDParam('id'), userController.getById);
 */
export const validateUUIDParam = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const paramValue = req.params[paramName];

    // UUID v4 regex pattern
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!paramValue || !uuidPattern.test(paramValue)) {
      return sendError(
        res,
        `Invalid ${paramName} format. Expected a valid UUID.`,
        400
      );
    }

    next();
  };
};
