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
import { sendSuccess, sendError } from '../utils/response';
import { UserRole } from '../types';

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    return sendSuccess(res, 'Users retrieved successfully', { users });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve users', 500);
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
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
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return sendError(res, 'User not found', 404);
    }
    return sendError(res, error.message || 'Failed to retrieve user', 500);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
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

    if (!firstName && !lastName && !email) {
      return sendError(res, 'At least one field (firstName, lastName, email) is required', 400);
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return sendError(res, 'Invalid email format', 400);
      }
    }

    const user = await updateUserProfile(id, { firstName, lastName, email });
    return sendSuccess(res, 'Profile updated successfully', { user });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return sendError(res, 'User not found', 404);
    }
    if (error.message.includes('already in use')) {
      return sendError(res, error.message, 409);
    }
    return sendError(res, error.message || 'Failed to update profile', 500);
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
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

    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current password and new password are required', 400);
    }

    const result = await updateUserPassword(id, currentPassword, newPassword);
    return sendSuccess(res, result.message);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return sendError(res, 'User not found', 404);
    }
    if (error.message.includes('incorrect') || error.message.includes('at least')) {
      return sendError(res, error.message, 400);
    }
    return sendError(res, error.message || 'Failed to update password', 500);
  }
};

export const removeUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await deleteUser(id);
    return sendSuccess(res, result.message);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return sendError(res, 'User not found', 404);
    }
    return sendError(res, error.message || 'Failed to delete user', 500);
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
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
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return sendError(res, 'User not found', 404);
    }
    return sendError(res, error.message || 'Failed to retrieve statistics', 500);
  }
};

/**
 * Creates a new user with specified role (Super Admin only)
 * SECURITY: Protected by requireRole middleware
 * @route POST /api/users/admin/create
 */
export const adminCreateUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName || !role) {
      return sendError(res, 'All fields are required (email, password, firstName, lastName, role)', 400);
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

    // Role validation
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role)) {
      return sendError(res, `Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
    }

    const user = await createUserWithRole(email, password, firstName, lastName, role);

    return res.status(201).json({
      success: true,
      message: `User created successfully with role: ${role}`,
      data: { user },
    });
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return sendError(res, error.message, 409);
    }
    return sendError(res, error.message || 'Failed to create user', 500);
  }
};

/**
 * Updates a user's role (Super Admin only)
 * SECURITY: Protected by requireRole middleware
 * @route PATCH /api/users/:id/role
 */
export const adminUpdateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return sendError(res, 'Role is required', 400);
    }

    // Role validation
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role)) {
      return sendError(res, `Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
    }

    const user = await updateUserRole(id, role);

    return sendSuccess(res, `User role updated to: ${role}`, { user });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return sendError(res, 'User not found', 404);
    }
    return sendError(res, error.message || 'Failed to update user role', 500);
  }
};
