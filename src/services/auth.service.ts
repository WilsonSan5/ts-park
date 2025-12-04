import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { UserRole } from '../types';

// Get the User repository for database operations
const userRepository = AppDataSource.getRepository(User);

/**
 * Registers a new user with hashed password.
 * @param role Defaults to CLIENT if not specified
 * @throws Error if email already exists
 */
export const registerUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: UserRole = UserRole.CLIENT
) => {
  // Check for existing user
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // SECURITY: Hash password before storage
  const hashedPassword = await hashPassword(password);

  const user = userRepository.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role,
  });

  await userRepository.save(user);

  // SECURITY: Never send password to client
  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

/**
 * Authenticates user and generates JWT token.
 * Token expires in 24 hours.
 * @throws Error if credentials invalid or account inactive
 */
export const loginUser = async (email: string, password: string) => {
  // Find user by email
  const user = await userRepository.findOne({ where: { email } });

  if (!user) {
    // SECURITY: Don't reveal if email exists or password is wrong
    throw new Error('Invalid email or password');
  }

  // Compare provided password with stored hash
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Check account status
  if (user.status !== 'active') {
    throw new Error('Account is not active');
  }

  // Generate JWT token with user info
  const token = generateToken(user.id, user.email, user.role);

  // SECURITY: Never send password to client
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

/**
 * Retrieves current user profile by ID.
 * Fetches fresh data from database (token data may be stale).
 * @throws Error if user not found
 */
export const getCurrentUser = async (userId: string) => {
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  // SECURITY: Never send password to client
  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};
