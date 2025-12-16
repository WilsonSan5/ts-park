import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  verifyEmail as verifyEmailService,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword as resetPasswordService
} from '../services/auth.service';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { UserRole } from '../types';

/**
 * Handles public user registration.
 * SECURITY: Always creates users with CLIENT role.
 * Elevated roles (gym_owner, super_admin) must be assigned by admin.
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

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

    // SECURITY: Public registration always creates CLIENT role
    // Elevated roles must be assigned through admin endpoints
    const user = await registerUser(email, password, firstName, lastName, UserRole.CLIENT);

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

// ========== EMAIL VERIFICATION ==========

/**
 * Verifies user email using token from query or body.
 * @route GET /api/auth/verify-email?token=xxx OR POST with body
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    // Accept token from query (GET) or body (POST)
    const token = req.query.token as string || req.body.token;

    if (!token) {
      return sendError(res, 'Verification token is required', 400);
    }

    const user = await verifyEmailService(token);

    return sendSuccess(res, 'Email verified successfully', { user });

  } catch (error: any) {
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return sendError(res, error.message, 400);
    }

    return sendError(res, error.message || 'Email verification failed', 500);
  }
};

/**
 * Resends verification email to authenticated user.
 * Requires authentication.
 * @route POST /api/auth/resend-verification
 */
export const resendVerification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    await resendVerificationEmail(userId);

    return sendSuccess(res, 'Verification email sent successfully');

  } catch (error: any) {
    if (error.message.includes('already verified')) {
      return sendError(res, error.message, 400);
    }

    if (error.message.includes('not found')) {
      return sendError(res, error.message, 404);
    }

    return sendError(res, error.message || 'Failed to resend verification email', 500);
  }
};

// ========== PASSWORD RESET ==========

/**
 * Initiates password reset process.
 * Sends reset email if account exists (always returns success for security).
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 'Email is required', 400);
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Invalid email format', 400);
    }

    await requestPasswordReset(email);

    // SECURITY: Always return success, don't reveal if email exists
    return sendSuccess(
      res,
      'If an account with that email exists, a password reset link has been sent'
    );

  } catch (error: any) {
    return sendError(res, 'Failed to process password reset request', 500);
  }
};

/**
 * Resets password using reset token.
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return sendError(res, 'Token and new password are required', 400);
    }

    // Validate password length
    if (newPassword.length < 8) {
      return sendError(res, 'Password must be at least 8 characters long', 400);
    }

    await resetPasswordService(token, newPassword);

    return sendSuccess(res, 'Password reset successfully');

  } catch (error: any) {
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return sendError(res, error.message, 400);
    }

    return sendError(res, error.message || 'Password reset failed', 500);
  }
};