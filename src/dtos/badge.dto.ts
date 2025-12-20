import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, Min, MaxLength, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Badge rule types
 */
export enum BadgeRuleType {
  CHALLENGES_COMPLETED = 'challenges_completed',
  TOTAL_CALORIES = 'total_calories',
  CONSECUTIVE_DAYS = 'consecutive_days',
  TOTAL_WORKOUTS = 'total_workouts',
  TOTAL_DURATION = 'total_duration',
  FRIEND_COUNT = 'friend_count',
  GYM_VISITS = 'gym_visits',
}

/**
 * Badge rule operators
 */
export enum BadgeRuleOperator {
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  EQUAL = '=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
}

/**
 * DTO for creating a new badge
 */
export class CreateBadgeDTO {
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsString({ message: 'Icon must be a string' })
  @MaxLength(50, { message: 'Icon cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  icon: string;

  @IsNumber({}, { message: 'Points value must be a number' })
  @Min(1, { message: 'Points value must be at least 1' })
  pointsValue: number;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive?: boolean;
}

/**
 * DTO for updating a badge
 */
export class UpdateBadgeDTO {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsString({ message: 'Icon must be a string' })
  @MaxLength(50, { message: 'Icon cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  icon?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Points value must be a number' })
  @Min(1, { message: 'Points value must be at least 1' })
  pointsValue?: number;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive?: boolean;
}

/**
 * DTO for creating a badge rule
 */
export class CreateBadgeRuleDTO {
  @IsEnum(BadgeRuleType, {
    message: 'Rule type must be valid (challenges_completed, total_calories, consecutive_days, total_workouts, total_duration, friend_count, gym_visits)'
  })
  ruleType: BadgeRuleType;

  @IsEnum(BadgeRuleOperator, {
    message: 'Operator must be valid (>, >=, =, <, <=)'
  })
  operator: BadgeRuleOperator;

  @IsNumber({}, { message: 'Target value must be a number' })
  @Min(0, { message: 'Target value cannot be negative' })
  targetValue: number;

  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  description: string;
}

/**
 * DTO for assigning a badge to a user
 */
export class AssignBadgeDTO {
  @IsUUID('4', { message: 'Badge ID must be a valid UUID' })
  badgeId: string;

  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;
}
