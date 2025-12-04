import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Authentication Routes
 *
 * PUBLIC ROUTES (no authentication required):
 * - POST /api/auth/register - Create new user account
 * - POST /api/auth/login    - Authenticate and get JWT token
 *
 * PROTECTED ROUTES (requires JWT token):
 * - GET /api/auth/me - Get current user profile
 *
 * JWT Token Usage:
 * Protected routes require Authorization header: Bearer <token>
 * Token expires in 24 hours
 */

// PUBLIC ROUTES
router.post('/register', register);
router.post('/login', login);

// PROTECTED ROUTES
router.get('/me', authenticateToken, getMe);

export default router;
