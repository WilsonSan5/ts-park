import { LessThan } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { TokenBlacklist } from '../models/TokenBlacklist';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { UserRole } from '../types';
import { generateSecureToken, hashToken, getExpirationDate, isTokenExpired } from '../utils/tokens';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service';

// Get repositories for database operations
const userRepository = AppDataSource.getRepository(User);
const tokenBlacklistRepository = AppDataSource.getRepository(TokenBlacklist);

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
): Promise<Omit<User, 'password'>> => {
  // Check for existing user
  // SECURITY: Generic message to prevent email enumeration
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Registration failed. Please check your information and try again.');
  }

  // SECURITY: Hash password before storage
  const hashedPassword = await hashPassword(password);

  // Generate email verification token
  // SECURITY: Store hashed token, send raw token to user
  const rawVerificationToken = generateSecureToken();
  const hashedVerificationToken = hashToken(rawVerificationToken);

  const user = userRepository.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role,
    emailVerificationToken: hashedVerificationToken,
  });

  await userRepository.save(user);

  // Send verification email with RAW token (non-blocking in dev)
  try {
    await sendVerificationEmail(email, firstName, rawVerificationToken);
  } catch (error) {
    console.error('Email send failed during registration:', error);
    // Continue registration even if email fails
  }

  // SECURITY: Never send password to client
  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

/**
 * Authenticates user and generates JWT token.
 * Token expires in 24 hours.
 * @throws Error if credentials invalid or account inactive
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: Omit<User, 'password'>; token: string }> => {
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
export const getCurrentUser = async (
  userId: string
): Promise<Omit<User, 'password'>> => {
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  // SECURITY: Never send password to client
  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

// ========== EMAIL VERIFICATION ==========

/**
 * Generates and saves a new email verification token for user.
 * Sends verification email to user's address.
 * @param userId User ID to generate verification for
 * @throws Error if user not found
 */
export const generateEmailVerification = async (userId: string): Promise<void> => {
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  // Generate new token
  // SECURITY: Store hashed token, send raw token to user
  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  user.emailVerificationToken = hashedToken;

  await userRepository.save(user);

  // Send verification email with RAW token
  await sendVerificationEmail(user.email, user.firstName, rawToken);
};

/**
 * Verifies user's email using verification token.
 * Marks email as verified and clears verification token.
 * @param token Email verification token
 * @returns User object without password
 * @throws Error if token invalid or not found
 */
export const verifyEmail = async (token: string): Promise<Omit<User, 'password'>> => {
  // SECURITY: Hash incoming token to compare with stored hash
  const hashedToken = hashToken(token);
  const user = await userRepository.findOne({ where: { emailVerificationToken: hashedToken } });

  if (!user) {
    throw new Error('Invalid or expired verification token');
  }

  // Mark email as verified and clear token
  user.emailVerified = true;
  user.emailVerificationToken = undefined;

  await userRepository.save(user);

  // SECURITY: Never send password to client
  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

/**
 * Resends verification email to user.
 * Generates new token and sends fresh verification email.
 * @param userId User ID to resend verification for
 * @throws Error if user not found or already verified
 */
export const resendVerificationEmail = async (userId: string): Promise<void> => {
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.emailVerified) {
    throw new Error('Email already verified');
  }

  // Generate new token
  // SECURITY: Store hashed token, send raw token to user
  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  user.emailVerificationToken = hashedToken;

  await userRepository.save(user);

  // Send verification email with RAW token
  await sendVerificationEmail(user.email, user.firstName, rawToken);
};

// ========== PASSWORD RESET ==========

/**
 * Initiates password reset process.
 * SECURITY: Always returns void, doesn't reveal if email exists.
 * Generates reset token and sends email if user found.
 * @param email Email address to send reset link to
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  const user = await userRepository.findOne({ where: { email } });

  // SECURITY: Don't reveal if email exists
  if (!user) {
    return;
  }

  // Generate reset token and set expiration (1 hour)
  // SECURITY: Store hashed token, send raw token to user
  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const passwordResetExpires = getExpirationDate(1);

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = passwordResetExpires;

  await userRepository.save(user);

  // Send password reset email with RAW token
  await sendPasswordResetEmail(user.email, user.firstName, rawToken);
};

/**
 * Resets user password using reset token.
 * Validates token, expiration, and password requirements.
 * @param token Password reset token
 * @param newPassword New password to set
 * @throws Error if token invalid, expired, or password too weak
 */
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  // SECURITY: Hash incoming token to compare with stored hash
  const hashedToken = hashToken(token);
  const user = await userRepository.findOne({ where: { passwordResetToken: hashedToken } });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  // Check if token has expired
  if (isTokenExpired(user.passwordResetExpires)) {
    throw new Error('Reset token has expired');
  }

  // Validate password strength
  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password and clear reset fields
  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await userRepository.save(user);
};

// ========== TOKEN BLACKLIST ==========

/**
 * Adds a token to the blacklist, effectively logging out the user.
 * The token will be rejected by the auth middleware until it expires.
 * @param token The JWT token to blacklist
 * @param userId The user ID who owns the token
 * @param expiresAt When the token naturally expires
 */
export const blacklistToken = async (
  token: string,
  userId: string,
  expiresAt: Date
): Promise<void> => {
  // Check if token is already blacklisted
  const existing = await tokenBlacklistRepository.findOne({ where: { token } });
  if (existing) {
    return; // Already blacklisted, no action needed
  }

  const blacklistEntry = tokenBlacklistRepository.create({
    token,
    userId,
    expiresAt,
  });

  await tokenBlacklistRepository.save(blacklistEntry);
};

/**
 * Checks if a token has been blacklisted (user logged out).
 * @param token The JWT token to check
 * @returns true if token is blacklisted, false otherwise
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const entry = await tokenBlacklistRepository.findOne({ where: { token } });
  return !!entry;
};

/**
 * Cleans up expired tokens from the blacklist.
 * Should be run periodically (e.g., daily cron job) to prevent table bloat.
 * @returns Number of tokens removed
 */
export const cleanupExpiredTokens = async (): Promise<number> => {
  const result = await tokenBlacklistRepository.delete({
    expiresAt: LessThan(new Date()),
  });
  return result.affected || 0;
};
