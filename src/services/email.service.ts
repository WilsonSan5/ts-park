import nodemailer from 'nodemailer';
import { config } from '../config/env';

/**
 * Creates nodemailer transporter with configured settings.
 * For development with Gmail:
 * 1. Enable "Less secure app access" OR
 * 2. Use App Password (Settings > Security > 2-Step > App passwords)
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
};

/**
 * Sends email verification link to user.
 * Token should be included in verification URL.
 * @param email User's email address
 * @param firstName User's first name for personalization
 * @param token Email verification token
 */
export const sendVerificationEmail = async (
  email: string,
  firstName: string,
  token: string
): Promise<void> => {
  const transporter = createTransporter();

  // Use APP_URL from env or default to localhost
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'TSPark - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to TSPark, ${firstName}!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 32px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // In development, don't crash - just log the error
    if (config.nodeEnv === 'production') {
      throw new Error('Failed to send verification email');
    }
  }
};

/**
 * Sends password reset link to user.
 * Token should be included in reset URL.
 * @param email User's email address
 * @param firstName User's first name for personalization
 * @param token Password reset token
 */
export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  token: string
): Promise<void> => {
  const transporter = createTransporter();

  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/api/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'TSPark - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #ff6b6b; font-weight: bold;">This link will expire in 1 hour.</p>
        <p style="color: #999; font-size: 12px; margin-top: 32px;">
          If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    // In development, don't crash - just log the error
    if (config.nodeEnv === 'production') {
      throw new Error('Failed to send password reset email');
    }
  }
};
