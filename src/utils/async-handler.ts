import { Request, Response, NextFunction } from 'express';

/**
 * Type definition for async Express request handlers.
 * Represents an async function that handles HTTP requests and can return a Response or void.
 */
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<Response | void>;

/**
 * Wrapper for async Express route handlers to eliminate try/catch boilerplate.
 *
 * This utility wraps async controller functions and automatically catches any errors,
 * passing them to the Express error handling middleware via next(error).
 *
 * Benefits:
 * - Eliminates 100+ repetitive try/catch blocks across controllers
 * - Ensures all async errors are properly caught and handled
 * - Maintains clean, readable controller code
 * - Integrates seamlessly with existing error middleware
 *
 * @param fn - The async request handler function to wrap
 * @returns Express middleware function with automatic error handling
 *
 * @example
 * // Before: Manual try/catch in every controller
 * export const getUser = async (req: Request, res: Response) => {
 *   try {
 *     const user = await userService.findById(req.params.id);
 *     return sendSuccess(res, 'User found', { user });
 *   } catch (error: any) {
 *     return sendError(res, error.message, 500);
 *   }
 * };
 *
 * // After: Clean code with asyncHandler
 * export const getUser = asyncHandler(async (req: Request, res: Response) => {
 *   const user = await userService.findById(req.params.id);
 *   return sendSuccess(res, 'User found', { user });
 * });
 *
 * @example
 * // Works with explicit error throwing
 * export const createUser = asyncHandler(async (req: Request, res: Response) => {
 *   if (!req.body.email) {
 *     throw new ValidationError('Email is required'); // Caught automatically
 *   }
 *   const user = await userService.create(req.body);
 *   return sendCreated(res, 'User created', { user });
 * });
 */
export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
