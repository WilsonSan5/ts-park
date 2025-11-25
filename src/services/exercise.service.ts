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
 */
export const getAllExercises = async (
  filters: FilterExercisesDTO = {}
): Promise<Exercise[]> => {
  const query = exerciseRepository.createQueryBuilder('exercise');

  // Apply difficulty filter
  if (filters.difficulty) {
    query.andWhere('exercise.difficulty = :difficulty', {
      difficulty: filters.difficulty,
    });
  }

  // Apply muscle group filter
  if (filters.muscleGroup) {
    query.andWhere(':muscleGroup = ANY(exercise.muscleGroups)', {
      muscleGroup: filters.muscleGroup,
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

  // Update fields
  Object.assign(exercise, data);

  return await exerciseRepository.save(exercise);
};

/**
 * Delete an exercise (Super Admin only)
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

  await exerciseRepository.remove(exercise);
};

/**
 * Search exercises by name or description
 */
export const searchExercises = async (query: string): Promise<Exercise[]> => {
  return await exerciseRepository
    .createQueryBuilder('exercise')
    .where('exercise.name ILIKE :query OR exercise.description ILIKE :query', {
      query: `%${query}%`,
    })
    .orderBy('exercise.name', 'ASC')
    .getMany();
};

/**
 * Get exercises by muscle group
 */
export const getExercisesByMuscleGroup = async (
  muscleGroup: string
): Promise<Exercise[]> => {
  return await exerciseRepository
    .createQueryBuilder('exercise')
    .where(':muscleGroup = ANY(exercise.muscleGroups)', { muscleGroup })
    .orderBy('exercise.name', 'ASC')
    .getMany();
};

/**
 * Get exercises by difficulty
 */
export const getExercisesByDifficulty = async (
  difficulty: ExerciseDifficulty
): Promise<Exercise[]> => {
  return await exerciseRepository.find({
    where: { difficulty },
    order: { name: 'ASC' },
  });
};
