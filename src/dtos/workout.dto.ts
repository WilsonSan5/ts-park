import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, Min, MaxLength, IsEnum, IsUUID, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * DTO for workout exercise
 */
export class WorkoutExerciseDTO {
  @IsUUID('4', { message: 'Exercise ID must be a valid UUID' })
  exerciseId: string;

  @IsNumber({}, { message: 'Sets must be a number' })
  @Min(1, { message: 'Sets must be at least 1' })
  sets: number;

  @IsNumber({}, { message: 'Reps must be a number' })
  @Min(1, { message: 'Reps must be at least 1' })
  reps: number;

  @IsOptional()
  @IsNumber({}, { message: 'Rest time must be a number' })
  @Min(0, { message: 'Rest time cannot be negative' })
  restTime?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Weight must be a number' })
  @Min(0, { message: 'Weight cannot be negative' })
  weight?: number;
}

/**
 * DTO for creating a new workout
 */
export class CreateWorkoutDTO {
  @IsString({ message: 'Name must be a string' })
  @MaxLength(200, { message: 'Name cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsNumber({}, { message: 'Duration must be a number' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  duration: number;

  @IsOptional()
  @IsNumber({}, { message: 'Calories burned must be a number' })
  @Min(0, { message: 'Calories burned cannot be negative' })
  caloriesBurned?: number;

  @IsOptional()
  @IsArray({ message: 'Exercises must be an array' })
  @ValidateNested({ each: true, message: 'Each exercise must be valid' })
  @Type(() => WorkoutExerciseDTO)
  exercises?: WorkoutExerciseDTO[];
}

/**
 * DTO for updating a workout
 */
export class UpdateWorkoutDTO {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(200, { message: 'Name cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Duration must be a number' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  duration?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Calories burned must be a number' })
  @Min(0, { message: 'Calories burned cannot be negative' })
  caloriesBurned?: number;

  @IsOptional()
  @IsArray({ message: 'Exercises must be an array' })
  @ValidateNested({ each: true, message: 'Each exercise must be valid' })
  @Type(() => WorkoutExerciseDTO)
  exercises?: WorkoutExerciseDTO[];
}

/**
 * DTO for querying workouts with pagination
 */
export class WorkoutQueryDTO {
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;

  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  @IsIn(['createdAt', 'duration', 'caloriesBurned', 'name'], {
    message: 'Sort by must be one of: createdAt, duration, caloriesBurned, name'
  })
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: 'Sort order must be ASC or DESC' })
  sortOrder?: 'ASC' | 'DESC';
}
