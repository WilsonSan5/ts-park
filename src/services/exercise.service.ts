import { AppDataSource } from '../config/database';
import { Exercise, ExerciseDifficulty } from '../models/Exercise';
import { User } from '../models/User';
import { UserRole } from '../types';

const exerciseRepository = AppDataSource.getRepository(Exercise);
const userRepository = AppDataSource.getRepository(User);

interface CreateExerciseDTO {
  name: string;
  description: string;
  muscleGroups: string[];
  difficulty: ExerciseDifficulty;
  caloriesPerMinute: number;
  instructions?: string;
  videoUrl?: string;
  imageUrl?: string;
}

interface UpdateExerciseDTO {
  name?: string;
  description?: string;
  muscleGroups?: string[];
  difficulty?: ExerciseDifficulty;
  caloriesPerMinute?: number;
  instructions?: string;
  videoUrl?: string;
  imageUrl?: string;
}

interface FilterExercisesDTO {
  difficulty?: ExerciseDifficulty;
  muscleGroup?: string;
  search?: string;
}

/**
 * Create a new exercise (Super Admin only)
 */
export const createExercise = async (
  data: CreateExerciseDTO,
  createdById: string
): Promise<Exercise> => {
  // Verify the creator is a super admin
  const creator = await userRepository.findOne({ where: { id: createdById } });
  if (!creator || creator.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Only super administrators can create exercises');
  }

  const exercise = exerciseRepository.create({
    ...data,
    createdById,
  });

  return await exerciseRepository.save(exercise);
};

/**
 * Get all exercises with optional filters
 * Automatically excludes soft-deleted exercises
 */
export const getAllExercises = async (
  filters: FilterExercisesDTO = {}
): Promise<Exercise[]> => {
  const query = exerciseRepository.createQueryBuilder('exercise');

  // Always exclude deleted exercises
  query.where('exercise.isDeleted = :isDeleted', { isDeleted: false });

  // Apply difficulty filter
  if (filters.difficulty) {
    query.andWhere('exercise.difficulty = :difficulty', {
      difficulty: filters.difficulty,
    });
  }

  // Apply muscle group filter
  // Note: muscleGroups is stored as 'simple-array' (comma-separated string), not a PostgreSQL array
  // We use ILIKE to search within the comma-separated values
  if (filters.muscleGroup) {
    query.andWhere('exercise.muscleGroups ILIKE :muscleGroup', {
      muscleGroup: `%${filters.muscleGroup.toLowerCase()}%`,
    });
  }

  // Apply search filter (name or description)
  if (filters.search) {
    query.andWhere(
      '(exercise.name ILIKE :search OR exercise.description ILIKE :search)',
      {
        search: `%${filters.search}%`,
      }
    );
  }

  query.orderBy('exercise.name', 'ASC');

  return await query.getMany();
};

/**
 * Get exercise by ID
 * Returns exercise even if soft-deleted (for historical data access)
 */
export const getExerciseById = async (id: string): Promise<Exercise> => {
  const exercise = await exerciseRepository.findOne({
    where: { id },
    relations: ['createdBy'],
  });

  if (!exercise) {
    throw new Error('Exercise not found');
  }

  return exercise;
};

/**
 * Get active exercise by ID (excludes soft-deleted)
 */
export const getActiveExerciseById = async (id: string): Promise<Exercise> => {
  const exercise = await exerciseRepository.findOne({
    where: { id, isDeleted: false },
    relations: ['createdBy'],
  });

  if (!exercise) {
    throw new Error('Exercise not found');
  }

  return exercise;
};

/**
 * Update an exercise (Super Admin only)
 */
export const updateExercise = async (
  id: string,
  data: UpdateExerciseDTO,
  userId: string
): Promise<Exercise> => {
  // Verify the user is a super admin
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Only super administrators can update exercises');
  }

  const exercise = await exerciseRepository.findOne({ where: { id } });
  if (!exercise) {
    throw new Error('Exercise not found');
  }

  // Security: Whitelist allowed fields to prevent mass assignment vulnerability
  // Protected fields: id, createdById, createdAt, updatedAt
  const allowedFields = [
    'name',
    'description',
    'muscleGroups',
    'difficulty',
    'caloriesPerMinute',
    'instructions',
    'videoUrl',
    'imageUrl'
  ] as const;

  // Only update whitelisted fields - type-safe assignment
  type AllowedField = typeof allowedFields[number];
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      (exercise[field] as Exercise[AllowedField]) = data[field] as Exercise[AllowedField];
    }
  }

  return await exerciseRepository.save(exercise);
};

/**
 * Delete an exercise (Super Admin only) - Soft Delete
 *
 * Exercises are soft-deleted to preserve historical workout data.
 * Deleted exercises won't appear in listings but remain in the database.
 */
export const deleteExercise = async (
  id: string,
  userId: string
): Promise<void> => {
  // Verify the user is a super admin
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Only super administrators can delete exercises');
  }

  const exercise = await exerciseRepository.findOne({ where: { id } });
  if (!exercise) {
    throw new Error('Exercise not found');
  }

  if (exercise.isDeleted) {
    throw new Error('Exercise is already deleted');
  }

  // Soft delete: mark as deleted instead of removing
  exercise.isDeleted = true;
  exercise.deletedAt = new Date();
  await exerciseRepository.save(exercise);
};

/**
 * Restore a soft-deleted exercise (Super Admin only)
 */
export const restoreExercise = async (
  id: string,
  userId: string
): Promise<Exercise> => {
  // Verify the user is a super admin
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Only super administrators can restore exercises');
  }

  const exercise = await exerciseRepository.findOne({ where: { id } });
  if (!exercise) {
    throw new Error('Exercise not found');
  }

  if (!exercise.isDeleted) {
    throw new Error('Exercise is not deleted');
  }

  exercise.isDeleted = false;
  exercise.deletedAt = undefined;
  return await exerciseRepository.save(exercise);
};

/**
 * Search exercises by name or description
 * Automatically excludes soft-deleted exercises
 */
export const searchExercises = async (query: string): Promise<Exercise[]> => {
  return await exerciseRepository
    .createQueryBuilder('exercise')
    .where('exercise.isDeleted = :isDeleted', { isDeleted: false })
    .andWhere('(exercise.name ILIKE :query OR exercise.description ILIKE :query)', {
      query: `%${query}%`,
    })
    .orderBy('exercise.name', 'ASC')
    .getMany();
};

/**
 * Get exercises by muscle group
 * Note: muscleGroups is stored as 'simple-array' (comma-separated string)
 * Automatically excludes soft-deleted exercises
 */
export const getExercisesByMuscleGroup = async (
  muscleGroup: string
): Promise<Exercise[]> => {
  return await exerciseRepository
    .createQueryBuilder('exercise')
    .where('exercise.isDeleted = :isDeleted', { isDeleted: false })
    .andWhere('exercise.muscleGroups ILIKE :muscleGroup', {
      muscleGroup: `%${muscleGroup.toLowerCase()}%`,
    })
    .orderBy('exercise.name', 'ASC')
    .getMany();
};

/**
 * Get exercises by difficulty
 * Automatically excludes soft-deleted exercises
 */
export const getExercisesByDifficulty = async (
  difficulty: ExerciseDifficulty
): Promise<Exercise[]> => {
  return await exerciseRepository.find({
    where: { difficulty, isDeleted: false },
    order: { name: 'ASC' },
  });
};

/**
 * Get all deleted exercises (Super Admin only - for recovery purposes)
 */
export const getDeletedExercises = async (userId: string): Promise<Exercise[]> => {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Only super administrators can view deleted exercises');
  }

  return await exerciseRepository.find({
    where: { isDeleted: true },
    order: { deletedAt: 'DESC' },
  });
};
