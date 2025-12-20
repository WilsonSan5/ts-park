import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../types';

/**
 * User Registration DTO
 *
 * Validates user registration data.
 * SECURITY: Role assignment is controlled server-side, not from client input.
 *
 * @route POST /api/auth/register
 */
export class RegisterDTO {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  lastName: string;
}

/**
 * User Login DTO
 *
 * Validates user login credentials.
 *
 * @route POST /api/auth/login
 */
export class LoginDTO {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}

/**
 * Email Verification DTO
 *
 * Validates email verification token from query or body.
 *
 * @route GET /api/auth/verify-email?token=xxx
 * @route POST /api/auth/verify-email (body)
 */
export class VerifyEmailDTO {
  @IsNotEmpty({ message: 'Verification token is required' })
  @IsString({ message: 'Token must be a string' })
  token: string;
}

/**
 * Forgot Password DTO
 *
 * Validates forgot password request.
 *
 * @route POST /api/auth/forgot-password
 */
export class ForgotPasswordDTO {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;
}

/**
 * Reset Password DTO
 *
 * Validates password reset with token.
 *
 * @route POST /api/auth/reset-password
 */
export class ResetPasswordDTO {
  @IsNotEmpty({ message: 'Reset token is required' })
  @IsString({ message: 'Token must be a string' })
  token: string;

  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;
}

/**
 * Change Password DTO
 *
 * Validates password change for authenticated users.
 *
 * @route POST /api/auth/change-password
 */
export class ChangePasswordDTO {
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString({ message: 'Current password must be a string' })
  currentPassword: string;

  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;
}

/**
 * Update User Profile DTO
 *
 * Validates user profile updates.
 * All fields are optional for partial updates.
 *
 * @route PATCH /api/auth/me
 */
export class UpdateProfileDTO {
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  @MaxLength(500, { message: 'Bio cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  bio?: string;
}

/**
 * Admin User Creation DTO
 *
 * For Super Admin creating users with specific roles.
 * Extends RegisterDTO with role assignment.
 *
 * @route POST /api/admin/users (Super Admin only)
 */
export class AdminCreateUserDTO extends RegisterDTO {
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(UserRole, {
    message: `Role must be one of: ${Object.values(UserRole).join(', ')}`,
  })
  role: UserRole;
}

/**
 * Refresh Token DTO
 *
 * Validates refresh token request.
 *
 * @route POST /api/auth/refresh
 */
export class RefreshTokenDTO {
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString({ message: 'Refresh token must be a string' })
  refreshToken: string;
}
