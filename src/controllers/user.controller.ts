import { Request, Response } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserProfile,
  updateUserPassword,
  deleteUser,
  getUserStats,
  createUserWithRole,
  updateUserRole,
} from '../services/user.service';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';
import { UserRole } from '../types';

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await getAllUsers();
  return sendSuccess(res, 'Users retrieved successfully', { users });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const requestingUserId = req.user?.userId;
  const requestingUserRole = req.user?.role;

  if (!requestingUserId) {
    return sendError(res, 'User not authenticated', 401);
  }

  // SECURITY: Users can only view their own profile unless they are Super Admin
  if (id !== requestingUserId && requestingUserRole !== UserRole.SUPER_ADMIN) {
    return sendError(res, 'Access denied', 403);
  }

  const user = await getUserById(id);
  return sendSuccess(res, 'User retrieved successfully', { user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const requestingUserId = req.user?.userId;
  const requestingUserRole = req.user?.role;
  const { firstName, lastName, email } = req.body;

  if (!requestingUserId) {
    return sendError(res, 'User not authenticated', 401);
  }

  // SECURITY: Users can only update their own profile unless they are Super Admin
  if (id !== requestingUserId && requestingUserRole !== UserRole.SUPER_ADMIN) {
    return sendError(res, 'Access denied', 403);
  }

  const user = await updateUserProfile(id, { firstName, lastName, email });
  return sendSuccess(res, 'Profile updated successfully', { user });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const requestingUserId = req.user?.userId;
  const { currentPassword, newPassword } = req.body;

  if (!requestingUserId) {
    return sendError(res, 'User not authenticated', 401);
  }

  // SECURITY: Users can only change their own password
  if (id !== requestingUserId) {
    return sendError(res, 'Access denied', 403);
  }

  const result = await updateUserPassword(id, currentPassword, newPassword);
  return sendSuccess(res, result.message);
});

export const removeUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await deleteUser(id);
  return sendSuccess(res, result.message);
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const requestingUserId = req.user?.userId;
  const requestingUserRole = req.user?.role;

  if (!requestingUserId) {
    return sendError(res, 'User not authenticated', 401);
  }

  // SECURITY: Users can only view their own stats unless they are Super Admin
  if (id !== requestingUserId && requestingUserRole !== UserRole.SUPER_ADMIN) {
    return sendError(res, 'Access denied', 403);
  }

  const stats = await getUserStats(id);
  return sendSuccess(res, 'User statistics retrieved successfully', { stats });
});

/**
 * Creates a new user with specified role (Super Admin only)
 * SECURITY: Protected by requireRole middleware
 * @route POST /api/users/admin/create
 */
export const adminCreateUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role } = req.body;

  const user = await createUserWithRole(email, password, firstName, lastName, role);

  return sendCreated(res, `User created successfully with role: ${role}`, { user });
});

/**
 * Updates a user's role (Super Admin only)
 * SECURITY: Protected by requireRole middleware
 * @route PATCH /api/users/:id/role
 */
export const adminUpdateRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await updateUserRole(id, role);

  return sendSuccess(res, `User role updated to: ${role}`, { user });
});
