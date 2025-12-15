import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { UserRole, UserStatus } from '../types';

const userRepository = AppDataSource.getRepository(User);

export const getAllUsers = async () => {
  const users = await userRepository.find({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      emailVerified: true,
      totalPoints: true,
      createdAt: true,
      updatedAt: true,
    },
    order: { createdAt: 'DESC' },
  });

  return users;
};

export const getUserById = async (userId: string) => {
  const user = await userRepository.findOne({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      emailVerified: true,
      totalPoints: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }
) => {
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  if (data.email && data.email !== user.email) {
    const existingUser = await userRepository.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Email already in use');
    }
    user.email = data.email;
    user.emailVerified = false;
  }

  if (data.firstName) user.firstName = data.firstName;
  if (data.lastName) user.lastName = data.lastName;

  await userRepository.save(user);

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long');
  }

  // SECURITY: Hash new password before storage
  user.password = await hashPassword(newPassword);
  await userRepository.save(user);

  return { message: 'Password updated successfully' };
};

export const deleteUser = async (userId: string) => {
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  user.status = UserStatus.SUSPENDED;
  await userRepository.save(user);

  return { message: 'User account deactivated successfully' };
};

export const getUserStats = async (userId: string) => {
  const user = await userRepository.findOne({
    where: { id: userId },
    select: {
      id: true,
      totalPoints: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    userId: user.id,
    totalPoints: user.totalPoints,
    memberSince: user.createdAt,
  };
};

/**
 * Creates a user with specified role (Admin only)
 * SECURITY: This should only be called from admin-protected endpoints
 */
export const createUserWithRole = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: UserRole
) => {
  // Check for existing user
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Validate role
  if (!Object.values(UserRole).includes(role)) {
    throw new Error('Invalid role specified');
  }

  // SECURITY: Hash password before storage
  const hashedPassword = await hashPassword(password);

  const user = userRepository.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role,
    status: UserStatus.ACTIVE,
    emailVerified: true, // Admin-created users are pre-verified
  });

  await userRepository.save(user);

  // SECURITY: Never send password to client
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Updates a user's role (Admin only)
 * SECURITY: This should only be called from admin-protected endpoints
 */
export const updateUserRole = async (userId: string, newRole: UserRole) => {
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  // Validate role
  if (!Object.values(UserRole).includes(newRole)) {
    throw new Error('Invalid role specified');
  }

  user.role = newRole;
  await userRepository.save(user);

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
