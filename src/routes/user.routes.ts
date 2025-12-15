import { Router } from 'express';
import {
  listUsers,
  getUser,
  updateProfile,
  changePassword,
  removeUser,
  getStats,
  adminCreateUser,
  adminUpdateRole,
} from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../types';

const router = Router();

// ==================== ADMIN ROUTES (Super Admin Only) ====================

/**
 * @route POST /api/users/admin/create
 * @desc Create a user with any role (Super Admin only)
 * @access Super Admin
 */
router.post('/admin/create', authenticateToken, requireRole([UserRole.SUPER_ADMIN]), adminCreateUser);

// ==================== PUBLIC ROUTES ====================

/**
 * @route GET /api/users
 * @desc List all users
 * @access Super Admin
 */
router.get('/', authenticateToken, requireRole([UserRole.SUPER_ADMIN]), listUsers);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Authenticated (own profile) or Super Admin (any profile)
 */
router.get('/:id', authenticateToken, getUser);

/**
 * @route PATCH /api/users/:id
 * @desc Update user profile
 * @access Authenticated (own profile) or Super Admin (any profile)
 */
router.patch('/:id', authenticateToken, updateProfile);

/**
 * @route PATCH /api/users/:id/password
 * @desc Change user password
 * @access Authenticated (own password only)
 */
router.patch('/:id/password', authenticateToken, changePassword);

/**
 * @route PATCH /api/users/:id/role
 * @desc Update user role (Super Admin only)
 * @access Super Admin
 */
router.patch('/:id/role', authenticateToken, requireRole([UserRole.SUPER_ADMIN]), adminUpdateRole);

/**
 * @route DELETE /api/users/:id
 * @desc Deactivate user account
 * @access Super Admin
 */
router.delete('/:id', authenticateToken, requireRole([UserRole.SUPER_ADMIN]), removeUser);

/**
 * @route GET /api/users/:id/stats
 * @desc Get user statistics
 * @access Authenticated (own stats) or Super Admin (any stats)
 */
router.get('/:id/stats', authenticateToken, getStats);

export default router;
