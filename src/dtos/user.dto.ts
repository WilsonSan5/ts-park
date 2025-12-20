import { IsString, IsOptional, IsEmail, IsEnum, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../types';

/**
 * DTO for updating user profile
 *
 * @route PATCH /api/users/:id
 */
export class UpdateUserDTO {
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;
}

// Note: ChangePasswordDTO is defined in auth.dto.ts with more complete validation
// Note: AdminCreateUserDTO is defined in auth.dto.ts extending RegisterDTO

/**
 * DTO for admin updating user role
 */
export class AdminUpdateRoleDTO {
  @IsEnum(UserRole, { message: 'Role must be a valid user role (super_admin, gym_owner, client)' })
  role: UserRole;
}

/**
 * DTO for querying users (for listing)
 */
export class UserQueryDTO {
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role?: UserRole;

  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  @Transform(({ value }) => value?.trim())
  search?: string;
}
