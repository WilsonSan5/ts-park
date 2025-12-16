import { Router } from 'express';
import {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Authentication Routes
 *
 * PUBLIC ROUTES (no authentication required):
 * - POST /api/auth/register        - Create new user account
 * - POST /api/auth/login           - Authenticate and get JWT token
 * - GET  /api/auth/verify-email    - Verify email with token
 * - POST /api/auth/forgot-password - Request password reset
 * - POST /api/auth/reset-password  - Reset password with token
 *
 * PROTECTED ROUTES (requires JWT token):
 * - GET  /api/auth/me              - Get current user profile
 * - POST /api/auth/resend-verification - Resend verification email
 *
 * JWT Token Usage:
 * Protected routes require Authorization header: Bearer <token>
 * Token expires in 24 hours
 */

// PUBLIC ROUTES
router.post('/register', register);
router.post('/login', login);

// EMAIL VERIFICATION ROUTES
router.get('/verify-email', verifyEmail);        // Public - token in query
router.post('/resend-verification', authenticateToken, resendVerification);  // Protected

// PASSWORD RESET ROUTES
router.post('/forgot-password', forgotPassword);  // Public
router.post('/reset-password', resetPassword);    // Public - has token

// PROTECTED ROUTES
router.get('/me', authenticateToken, getMe);

export default router;
