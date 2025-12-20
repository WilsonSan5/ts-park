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
import { validateDTO, validateUUIDParam, ValidationSource } from '../middleware/validate.middleware';
import {
  UpdateUserDTO,
  ChangePasswordDTO,
  AdminCreateUserDTO,
  AdminUpdateRoleDTO,
  UserQueryDTO
} from '../dtos';
import { UserRole } from '../types';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     description: Retrieve all users (super_admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [client, gym_owner, super_admin]
 *         description: Filter by role
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires super_admin role
 */

/**
 * @swagger
 * /api/users/admin/create:
 *   post:
 *     summary: Create user with role
 *     description: Create a new user with any role (super_admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newadmin@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "SecurePass123!"
 *               firstName:
 *                 type: string
 *                 example: "Admin"
 *               lastName:
 *                 type: string
 *                 example: "User"
 *               role:
 *                 type: string
 *                 enum: [client, gym_owner, super_admin]
 *                 example: "gym_owner"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - requires super_admin role
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a specific user (own profile or super_admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *
 *   patch:
 *     summary: Update user profile
 *     description: Update user profile (own profile or super_admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *
 *   delete:
 *     summary: Deactivate user
 *     description: Deactivate a user account (super_admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       403:
 *         description: Forbidden - requires super_admin role
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/{id}/password:
 *   patch:
 *     summary: Change password
 *     description: Change user's own password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "OldPass123!"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "NewSecurePass456!"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password incorrect
 *       403:
 *         description: Forbidden - can only change own password
 */

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     description: Update a user's role (super_admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [client, gym_owner, super_admin]
 *                 example: "gym_owner"
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       403:
 *         description: Forbidden - requires super_admin role
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/{id}/stats:
 *   get:
 *     summary: Get user statistics
 *     description: Get user statistics (own stats or super_admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     totalPoints:
 *                       type: integer
 *                       example: 1500
 *                     memberSince:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */

// ==================== ADMIN ROUTES (Super Admin Only) ====================

router.post(
  '/admin/create',
  authenticateToken,
  requireRole([UserRole.SUPER_ADMIN]),
  validateDTO(AdminCreateUserDTO),
  adminCreateUser
);

// ==================== PUBLIC ROUTES ====================

/**
 * @route GET /api/users
 * @desc List all users
 * @access Super Admin
 */
router.get(
  '/',
  authenticateToken,
  requireRole([UserRole.SUPER_ADMIN]),
  validateDTO(UserQueryDTO, ValidationSource.QUERY),
  listUsers
);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Authenticated (own profile) or Super Admin (any profile)
 */
router.get('/:id', authenticateToken, validateUUIDParam('id'), getUser);

/**
 * @route PATCH /api/users/:id
 * @desc Update user profile
 * @access Authenticated (own profile) or Super Admin (any profile)
 */
router.patch(
  '/:id',
  authenticateToken,
  validateUUIDParam('id'),
  validateDTO(UpdateUserDTO),
  updateProfile
);

/**
 * @route PATCH /api/users/:id/password
 * @desc Change user password
 * @access Authenticated (own password only)
 */
router.patch(
  '/:id/password',
  authenticateToken,
  validateUUIDParam('id'),
  validateDTO(ChangePasswordDTO),
  changePassword
);

/**
 * @route PATCH /api/users/:id/role
 * @desc Update user role (Super Admin only)
 * @access Super Admin
 */
router.patch(
  '/:id/role',
  authenticateToken,
  requireRole([UserRole.SUPER_ADMIN]),
  validateUUIDParam('id'),
  validateDTO(AdminUpdateRoleDTO),
  adminUpdateRole
);

/**
 * @route DELETE /api/users/:id
 * @desc Deactivate user account
 * @access Super Admin
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole([UserRole.SUPER_ADMIN]),
  validateUUIDParam('id'),
  removeUser
);

/**
 * @route GET /api/users/:id/stats
 * @desc Get user statistics
 * @access Authenticated (own stats) or Super Admin (any stats)
 */
router.get('/:id/stats', authenticateToken, validateUUIDParam('id'), getStats);

export default router;
