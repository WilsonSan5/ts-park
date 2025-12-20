import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, IsDate, ValidateNested, IsArray, Min, MaxLength, IsObject } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ChallengeType, ChallengeDifficulty, ChallengeStatus } from '../types';

/**
 * DTO for challenge objectives
 */
export class ChallengeObjectivesDTO {
  @IsOptional()
  @IsNumber({}, { message: 'Target duration must be a number' })
  @Min(1, { message: 'Target duration must be at least 1 minute' })
  targetDuration?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Target calories must be a number' })
  @Min(1, { message: 'Target calories must be at least 1' })
  targetCalories?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Target workouts must be a number' })
  @Min(1, { message: 'Target workouts must be at least 1' })
  targetWorkouts?: number;
}

/**
 * DTO for creating a new challenge
 */
export class CreateChallengeDTO {
  @IsString({ message: 'Title must be a string' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsEnum(ChallengeType, { message: 'Type must be a valid challenge type (individual, team, social)' })
  type: ChallengeType;

  @IsEnum(ChallengeDifficulty, { message: 'Difficulty must be a valid level (easy, medium, hard, extreme)' })
  difficulty: ChallengeDifficulty;

  @IsObject({ message: 'Objectives must be an object' })
  @ValidateNested({ message: 'Objectives must be valid' })
  @Type(() => ChallengeObjectivesDTO)
  objectives: ChallengeObjectivesDTO;

  @IsDate({ message: 'Start date must be a valid date' })
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @IsDate({ message: 'End date must be a valid date' })
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @IsOptional()
  @IsNumber({}, { message: 'Max participants must be a number' })
  @Min(1, { message: 'Max participants must be at least 1' })
  maxParticipants?: number;

  @IsNumber({}, { message: 'Points reward must be a number' })
  @Min(0, { message: 'Points reward cannot be negative' })
  pointsReward: number;

  @IsBoolean({ message: 'Is public must be a boolean' })
  isPublic: boolean;

  @IsOptional()
  @IsUUID('4', { message: 'Gym ID must be a valid UUID' })
  gymId?: string;

  @IsOptional()
  @IsArray({ message: 'Recommended exercise IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each exercise ID must be a valid UUID' })
  recommendedExerciseIds?: string[];
}

/**
 * DTO for updating a challenge
 */
export class UpdateChallengeDTO {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsEnum(ChallengeType, { message: 'Type must be a valid challenge type (individual, team, social)' })
  type?: ChallengeType;

  @IsOptional()
  @IsEnum(ChallengeDifficulty, { message: 'Difficulty must be a valid level (easy, medium, hard, extreme)' })
  difficulty?: ChallengeDifficulty;

  @IsOptional()
  @IsEnum(ChallengeStatus, { message: 'Status must be a valid status (active, completed, cancelled)' })
  status?: ChallengeStatus;

  @IsOptional()
  @IsObject({ message: 'Objectives must be an object' })
  @ValidateNested({ message: 'Objectives must be valid' })
  @Type(() => ChallengeObjectivesDTO)
  objectives?: ChallengeObjectivesDTO;

  @IsOptional()
  @IsDate({ message: 'Start date must be a valid date' })
  @Transform(({ value }) => new Date(value))
  startDate?: Date;

  @IsOptional()
  @IsDate({ message: 'End date must be a valid date' })
  @Transform(({ value }) => new Date(value))
  endDate?: Date;

  @IsOptional()
  @IsNumber({}, { message: 'Max participants must be a number' })
  @Min(1, { message: 'Max participants must be at least 1' })
  maxParticipants?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Points reward must be a number' })
  @Min(0, { message: 'Points reward cannot be negative' })
  pointsReward?: number;

  @IsOptional()
  @IsBoolean({ message: 'Is public must be a boolean' })
  isPublic?: boolean;

  @IsOptional()
  @IsArray({ message: 'Recommended exercise IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each exercise ID must be a valid UUID' })
  recommendedExerciseIds?: string[];
}

/**
 * DTO for querying challenges with filters
 */
export class ChallengeQueryDTO {
  @IsOptional()
  @IsEnum(ChallengeType, { message: 'Type must be a valid challenge type' })
  type?: ChallengeType;

  @IsOptional()
  @IsEnum(ChallengeDifficulty, { message: 'Difficulty must be a valid level' })
  difficulty?: ChallengeDifficulty;

  @IsOptional()
  @IsUUID('4', { message: 'Gym ID must be a valid UUID' })
  gymId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Is public must be a boolean' })
  isPublic?: boolean;
}
