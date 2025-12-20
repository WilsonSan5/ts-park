import { IsString, IsOptional, IsNumber, IsArray, IsEmail, IsBoolean, Min, MaxLength, ArrayMinSize } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for creating a new gym
 */
export class CreateGymDTO {
  @IsString({ message: 'Name must be a string' })
  @MaxLength(200, { message: 'Name cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsString({ message: 'Address must be a string' })
  @MaxLength(500, { message: 'Address cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  address: string;

  @IsString({ message: 'City must be a string' })
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  city: string;

  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone cannot exceed 20 characters' })
  @Transform(({ value }) => value?.trim())
  phone: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsNumber({}, { message: 'Capacity must be a number' })
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity: number;

  @IsArray({ message: 'Equipment must be an array' })
  @ArrayMinSize(1, { message: 'Equipment list must contain at least one item' })
  @IsString({ each: true, message: 'Each equipment item must be a string' })
  @Transform(({ value }) => value?.map((item: string) => item.trim()))
  equipment: string[];

  @IsOptional()
  @IsArray({ message: 'Specialized exercise types must be an array' })
  @IsString({ each: true, message: 'Each exercise type must be a string' })
  @Transform(({ value }) => value?.map((item: string) => item.trim()))
  specializedExerciseTypes?: string[];
}

/**
 * DTO for updating a gym
 */
export class UpdateGymDTO {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(200, { message: 'Name cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(500, { message: 'Address cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  address?: string;

  @IsOptional()
  @IsString({ message: 'City must be a string' })
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  city?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone cannot exceed 20 characters' })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Capacity must be a number' })
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity?: number;

  @IsOptional()
  @IsArray({ message: 'Equipment must be an array' })
  @ArrayMinSize(1, { message: 'Equipment list must contain at least one item' })
  @IsString({ each: true, message: 'Each equipment item must be a string' })
  @Transform(({ value }) => value?.map((item: string) => item.trim()))
  equipment?: string[];

  @IsOptional()
  @IsArray({ message: 'Specialized exercise types must be an array' })
  @IsString({ each: true, message: 'Each exercise type must be a string' })
  @Transform(({ value }) => value?.map((item: string) => item.trim()))
  specializedExerciseTypes?: string[];
}

/**
 * DTO for querying gyms with filters
 */
export class GymQueryDTO {
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  @Transform(({ value }) => value?.trim())
  city?: string;

  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  @Transform(({ value }) => value?.trim())
  search?: string;
}

/**
 * DTO for gym approval by Super Admin
 * Note: The approve endpoint doesn't require body parameters
 * as it simply approves the gym identified by URL param.
 * This DTO exists for potential future extensions (e.g., rejection reason).
 */
export class GymApprovalDTO {
  @IsOptional()
  @IsBoolean({ message: 'isApproved must be a boolean' })
  isApproved?: boolean;
}
