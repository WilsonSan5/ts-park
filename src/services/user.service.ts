import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { UserStatus } from '../types';

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
