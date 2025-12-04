import { Request, Response } from 'express';
import { registerUser, loginUser, getCurrentUser } from '../services/auth.service';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { UserRole } from '../types';

/**
 * Handles user registration.
 * Validates input and creates new user account.
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName) {
      return sendError(res, 'All fields are required (email, password, firstName, lastName)', 400);
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Invalid email format', 400);
    }

    // Password strength validation
    if (password.length < 8) {
      return sendError(res, 'Password must be at least 8 characters long', 400);
    }

    // Call service to register user
    const user = await registerUser(email, password, firstName, lastName, role as UserRole);

    return sendCreated(res, 'User registered successfully', { user });

  } catch (error: any) {
    // Handle duplicate email error
    if (error.message.includes('already exists')) {
      return sendError(res, error.message, 409); // 409 = Conflict
    }

    return sendError(res, error.message || 'Registration failed', 500);
  }
};

/**
 * Handles user login.
 * Validates credentials and returns JWT token.
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    // Call service to authenticate user
    const result = await loginUser(email, password);

    return sendSuccess(res, 'Login successful', result);

  } catch (error: any) {
    // Handle authentication errors
    if (error.message.includes('Invalid') || error.message.includes('not active')) {
      return sendError(res, error.message, 401); // 401 = Unauthorized
    }

    return sendError(res, error.message || 'Login failed', 500);
  }
};

/**
 * Retrieves current authenticated user profile.
 * IMPORTANT: Requires authenticateToken middleware.
 * @route GET /api/auth/me
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    // Get userId from authenticated request (set by middleware)
    const userId = (req as any).user?.userId;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Fetch fresh user data from database
    const user = await getCurrentUser(userId);

    return sendSuccess(res, 'User profile retrieved successfully', { user });

  } catch (error: any) {
    if (error.message.includes('not found')) {
      return sendError(res, 'User not found', 404); // 404 = Not Found
    }

    return sendError(res, error.message || 'Failed to retrieve user profile', 500);
  }
};
