import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsUrl, Min, MaxLength, ArrayMinSize } from 'class-validator';
import { Transform } from 'class-transformer';
import { ExerciseDifficulty } from '../models/Exercise';

/**
 * DTO for creating a new exercise
 */
export class CreateExerciseDTO {
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsArray({ message: 'Muscle groups must be an array' })
  @ArrayMinSize(1, { message: 'At least one muscle group must be specified' })
  @IsString({ each: true, message: 'Each muscle group must be a string' })
  @Transform(({ value }) => value?.map((item: string) => item.trim().toLowerCase()))
  muscleGroups: string[];

  @IsEnum(ExerciseDifficulty, { message: 'Difficulty must be a valid level (beginner, intermediate, advanced, expert)' })
  difficulty: ExerciseDifficulty;

  @IsNumber({}, { message: 'Calories per minute must be a number' })
  @Min(0.1, { message: 'Calories per minute must be at least 0.1' })
  caloriesPerMinute: number;

  @IsOptional()
  @IsString({ message: 'Instructions must be a string' })
  @MaxLength(5000, { message: 'Instructions cannot exceed 5000 characters' })
  @Transform(({ value }) => value?.trim())
  instructions?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Video URL must be a valid URL' })
  @Transform(({ value }) => value?.trim())
  videoUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  @Transform(({ value }) => value?.trim())
  imageUrl?: string;
}

/**
 * DTO for updating an exercise
 */
export class UpdateExerciseDTO {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsArray({ message: 'Muscle groups must be an array' })
  @ArrayMinSize(1, { message: 'At least one muscle group must be specified' })
  @IsString({ each: true, message: 'Each muscle group must be a string' })
  @Transform(({ value }) => value?.map((item: string) => item.trim().toLowerCase()))
  muscleGroups?: string[];

  @IsOptional()
  @IsEnum(ExerciseDifficulty, { message: 'Difficulty must be a valid level (beginner, intermediate, advanced, expert)' })
  difficulty?: ExerciseDifficulty;

  @IsOptional()
  @IsNumber({}, { message: 'Calories per minute must be a number' })
  @Min(0.1, { message: 'Calories per minute must be at least 0.1' })
  caloriesPerMinute?: number;

  @IsOptional()
  @IsString({ message: 'Instructions must be a string' })
  @MaxLength(5000, { message: 'Instructions cannot exceed 5000 characters' })
  @Transform(({ value }) => value?.trim())
  instructions?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Video URL must be a valid URL' })
  @Transform(({ value }) => value?.trim())
  videoUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  @Transform(({ value }) => value?.trim())
  imageUrl?: string;
}

/**
 * DTO for querying exercises with filters
 */
export class ExerciseQueryDTO {
  @IsOptional()
  @IsEnum(ExerciseDifficulty, { message: 'Difficulty must be a valid level' })
  difficulty?: ExerciseDifficulty;

  @IsOptional()
  @IsString({ message: 'Muscle group must be a string' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  muscleGroup?: string;

  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  @Transform(({ value }) => value?.trim())
  search?: string;
}
