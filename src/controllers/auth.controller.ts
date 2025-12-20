import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  verifyEmail as verifyEmailService,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword as resetPasswordService,
  blacklistToken
} from '../services/auth.service';
import { decodeToken } from '../utils/jwt';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';
import { UserRole } from '../types';

/**
 * Handles public user registration.
 * SECURITY: Always creates users with CLIENT role.
 * Elevated roles (gym_owner, super_admin) must be assigned by admin.
 * @route POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  // SECURITY: Public registration always creates CLIENT role
  // Elevated roles must be assigned through admin endpoints
  const user = await registerUser(email, password, firstName, lastName, UserRole.CLIENT);

  return sendCreated(res, 'User registered successfully', { user });
});

/**
 * Handles user login.
 * Validates credentials and returns JWT token.
 * @route POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Call service to authenticate user
  const result = await loginUser(email, password);

  return sendSuccess(res, 'Login successful', result);
});

/**
 * Retrieves current authenticated user profile.
 * IMPORTANT: Requires authenticateToken middleware.
 * @route GET /api/auth/me
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // Get userId from authenticated request (set by middleware)
  const userId = req.user?.userId;

  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  // Fetch fresh user data from database
  const user = await getCurrentUser(userId);

  return sendSuccess(res, 'User profile retrieved successfully', { user });
});

// ========== EMAIL VERIFICATION ==========

/**
 * Verifies user email using token from query or body.
 * @route GET /api/auth/verify-email?token=xxx OR POST with body
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  // Accept token from query (GET) or body (POST)
  const token = req.query.token as string || req.body.token;

  if (!token) {
    return sendError(res, 'Verification token is required', 400);
  }

  const user = await verifyEmailService(token);

  return sendSuccess(res, 'Email verified successfully', { user });
});

/**
 * Resends verification email to authenticated user.
 * Requires authentication.
 * @route POST /api/auth/resend-verification
 */
export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  await resendVerificationEmail(userId);

  return sendSuccess(res, 'Verification email sent successfully');
});

// ========== PASSWORD RESET ==========

/**
 * Initiates password reset process.
 * Sends reset email if account exists (always returns success for security).
 * SECURITY: Always returns success - never reveals if email exists in system.
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    await requestPasswordReset(email);

    // SECURITY: Always return success, don't reveal if email exists
    return sendSuccess(
      res,
      'If an account with that email exists, a password reset link has been sent'
    );

  } catch {
    // SECURITY: Still return success even on error to prevent email enumeration
    return sendSuccess(
      res,
      'If an account with that email exists, a password reset link has been sent'
    );
  }
};

/**
 * Resets password using reset token.
 * @route POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  await resetPasswordService(token, newPassword);

  return sendSuccess(res, 'Password reset successfully');
});

// ========== LOGOUT ==========

/**
 * Logs out the current user by blacklisting their token.
 * The token is added to a blacklist and will be rejected by the auth middleware.
 * SECURITY: Token is invalidated server-side, preventing reuse even if stolen.
 * @route POST /api/auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Get userId from authenticated request (set by middleware)
  const userId = req.user?.userId;

  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  if (!token) {
    return sendError(res, 'No token provided', 400);
  }

  // Decode token to get expiration time
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return sendError(res, 'Invalid token', 400);
  }

  // Calculate expiration date from Unix timestamp
  const expiresAt = new Date(decoded.exp * 1000);

  // Add token to blacklist
  await blacklistToken(token, userId, expiresAt);

  return sendSuccess(res, 'Logged out successfully. Your token has been invalidated.');
});