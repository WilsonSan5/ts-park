import { AppDataSource } from '@config/database';
import { Workout as WorkoutDTO, PaginationDTO, PaginatedResponse } from '../types/index';
import { Workout } from '../models/Workout';
import { WorkoutExercise as WorkoutExerciseModel } from '../models/WorkoutExercice';
import { Exercise } from '../models/Exercise';
import { ParticipationService } from './participation.service';
import { BadgeRuleService } from './badge-rule.service';
import { In } from 'typeorm';
import { validate as uuidValidate } from 'uuid';

// Security: Whitelist of allowed sort fields to prevent SQL injection
const ALLOWED_WORKOUT_SORT_FIELDS = ['createdAt', 'updatedAt', 'duration', 'caloriesBurned', 'name'] as const;
type WorkoutSortField = typeof ALLOWED_WORKOUT_SORT_FIELDS[number];

export class WorkoutService {
  private participationService: ParticipationService;
  private badgeRuleService: BadgeRuleService;

  constructor() {
    this.participationService = new ParticipationService();
    this.badgeRuleService = new BadgeRuleService();
  }
  public async createWorkout(workoutData: WorkoutDTO): Promise<Workout | null> {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      // Create the workout entity
      const workout = transactionalEntityManager.create(Workout, {
        name: workoutData.name,
        description: workoutData.description,
        duration: workoutData.duration,
        caloriesBurned: workoutData.caloriesBurned,
        userId: workoutData.userId,
      });

      const savedWorkout = await transactionalEntityManager.save(Workout, workout);

      // Create WorkoutExercise entries if exercises are provided
      if (workoutData.exercises && workoutData.exercises.length > 0) {
        const exerciseRepository = transactionalEntityManager.getRepository(Exercise);

        // Validate that all exercises exist
        const exerciseIds = workoutData.exercises.map(ex => ex.exerciseId);

        // Security: Validate all exercise IDs are proper UUIDs to prevent injection
        if (!exerciseIds.every(id => uuidValidate(id))) {
          throw new Error('Invalid exercise ID format');
        }

        const existingExercises = await exerciseRepository.findBy({ id: In(exerciseIds) });

        // SECURITY: Generic message to prevent ID enumeration
        if (existingExercises.length !== exerciseIds.length) {
          throw new Error('Invalid exercise data provided');
        }

        // Create WorkoutExercise entries with order
        const workoutExercises = workoutData.exercises.map((exercise, index) => {
          return transactionalEntityManager.create(WorkoutExerciseModel, {
            workoutId: savedWorkout.id,
            exerciseId: exercise.exerciseId,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight || 0,
            restTime: exercise.restTime || 60,
            order: index,
          });
        });

        await transactionalEntityManager.save(WorkoutExerciseModel, workoutExercises);
      }

      // Load and return the workout with workoutExercises relation
      const workoutWithExercises = await transactionalEntityManager.findOne(Workout, {
        where: { id: savedWorkout.id },
        relations: ['workoutExercises', 'workoutExercises.exercise'],
      });

      // Update challenge participation progress after workout is saved
      if (workoutWithExercises) {
        await this.participationService.updateProgressFromWorkout(
          workoutData.userId,
          workoutWithExercises
        );

        // Evaluate badge rules and auto-award badges if conditions are met
        await this.badgeRuleService.evaluateRulesForUser(workoutData.userId);
      }

      return workoutWithExercises;
    });
  }

  public async getMyWorkouts(
    userId: string,
    pagination?: PaginationDTO
  ): Promise<PaginatedResponse<Workout>> {
    const workoutRepository = AppDataSource.getRepository(Workout);

    // Set default pagination values
    const page = pagination?.page && pagination.page > 0 ? pagination.page : 1;
    const limit = pagination?.limit && pagination.limit > 0 ? pagination.limit : 20;

    // Security: Validate sortBy against whitelist to prevent SQL injection
    const requestedSortBy = pagination?.sortBy;
    const sortBy: WorkoutSortField = ALLOWED_WORKOUT_SORT_FIELDS.includes(requestedSortBy as WorkoutSortField)
      ? (requestedSortBy as WorkoutSortField)
      : 'createdAt';

    // Security: Only allow 'ASC' or 'DESC' for sort order
    const sortOrder = pagination?.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const [workouts, total] = await workoutRepository.findAndCount({
      where: { userId },
      relations: ['workoutExercises', 'workoutExercises.exercise'],
      order: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
      data: workouts,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async getWorkoutStatistics(userId: string): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    totalCaloriesBurned: number;
    workoutsThisWeek: number;
    workoutsThisMonth: number;
    mostUsedExercises: Array<{ exerciseId: string; name: string; count: number }>;
    averageDuration: number;
    averageCalories: number;
    currentStreak: number;
  }> {
    const workoutRepository = AppDataSource.getRepository(Workout);
    const workouts = await workoutRepository.find({ where: { userId } });

    // Basic stats
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);
    const totalCaloriesBurned = workouts.reduce((sum, workout) => sum + workout.caloriesBurned, 0);

    // Handle case when no workouts exist
    if (totalWorkouts === 0) {
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        totalCaloriesBurned: 0,
        workoutsThisWeek: 0,
        workoutsThisMonth: 0,
        mostUsedExercises: [],
        averageDuration: 0,
        averageCalories: 0,
        currentStreak: 0,
      };
    }

    // Time-based stats
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const workoutsThisWeek = workouts.filter(w => new Date(w.createdAt) >= sevenDaysAgo).length;
    const workoutsThisMonth = workouts.filter(w => new Date(w.createdAt) >= thirtyDaysAgo).length;

    // Exercise analysis - Top 5 most used exercises
    const exerciseRepository = AppDataSource.getRepository(WorkoutExerciseModel);
    const mostUsedExercises = await exerciseRepository
      .createQueryBuilder('we')
      .select('we.exerciseId', 'exerciseId')
      .addSelect('e.name', 'name')
      .addSelect('COUNT(we.id)', 'count')
      .innerJoin('we.workout', 'w')
      .innerJoin('we.exercise', 'e')
      .where('w.userId = :userId', { userId })
      .groupBy('we.exerciseId')
      .addGroupBy('e.name')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    // Averages
    const averageDuration = Math.round(totalDuration / totalWorkouts);
    const averageCalories = Math.round(totalCaloriesBurned / totalWorkouts);

    // Streak calculation - consecutive days with at least one workout
    const currentStreak = await this.calculateWorkoutStreak(userId);

    return {
      totalWorkouts,
      totalDuration,
      totalCaloriesBurned,
      workoutsThisWeek,
      workoutsThisMonth,
      mostUsedExercises: mostUsedExercises.map(ex => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        count: parseInt(ex.count, 10),
      })),
      averageDuration,
      averageCalories,
      currentStreak,
    };
  }

  private async calculateWorkoutStreak(userId: string): Promise<number> {
    const workoutRepository = AppDataSource.getRepository(Workout);

    // Get all workouts sorted by date descending
    const workouts = await workoutRepository
      .createQueryBuilder('workout')
      .where('workout.userId = :userId', { userId })
      .orderBy('workout.createdAt', 'DESC')
      .getMany();

    if (workouts.length === 0) {
      return 0;
    }

    // Extract unique dates (YYYY-MM-DD format)
    const workoutDates = new Set<string>();
    workouts.forEach(workout => {
      const dateStr = new Date(workout.createdAt).toISOString().split('T')[0];
      workoutDates.add(dateStr);
    });

    const sortedDates = Array.from(workoutDates).sort().reverse();

    // Check if there's a workout today or yesterday
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Streak must start from today or yesterday
    if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
      return 0;
    }

    // Count consecutive days
    let streak = 0;
    let currentDate = new Date(sortedDates[0]);

    for (const dateStr of sortedDates) {
      const workoutDate = new Date(dateStr);
      const expectedDateStr = currentDate.toISOString().split('T')[0];

      if (dateStr === expectedDateStr) {
        streak++;
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    return streak;
  }

  public async getWorkoutById(id: string, userId: string): Promise<Workout> {
    const workoutRepository = AppDataSource.getRepository(Workout);

    const workout = await workoutRepository.findOne({
      where: { id },
      relations: ['workoutExercises', 'workoutExercises.exercise'],
    });

    if (!workout) {
      throw new Error('Workout not found');
    }

    if (workout.userId !== userId) {
      throw new Error('You do not have permission to access this workout');
    }

    return workout;
  }

  public async updateWorkout(id: string, data: Partial<WorkoutDTO>, userId: string): Promise<Workout | null> {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      const workoutRepository = transactionalEntityManager.getRepository(Workout);

      // Find and verify ownership
      const workout = await workoutRepository.findOne({ where: { id } });

      if (!workout) {
        throw new Error('Workout not found');
      }

      if (workout.userId !== userId) {
        throw new Error('You do not have permission to update this workout');
      }

      // Update workout fields
      if (data.name !== undefined) workout.name = data.name;
      if (data.description !== undefined) workout.description = data.description;
      if (data.duration !== undefined) workout.duration = data.duration;
      if (data.caloriesBurned !== undefined) workout.caloriesBurned = data.caloriesBurned;

      const updatedWorkout = await transactionalEntityManager.save(Workout, workout);

      // Handle exercises update if provided
      if (data.exercises !== undefined) {
        // Delete existing WorkoutExercise entries
        const workoutExerciseRepository = transactionalEntityManager.getRepository(WorkoutExerciseModel);
        await workoutExerciseRepository.delete({ workoutId: id });

        // Create new WorkoutExercise entries if provided
        if (data.exercises.length > 0) {
          const exerciseRepository = transactionalEntityManager.getRepository(Exercise);

          // Validate that all exercises exist
          const exerciseIds = data.exercises.map(ex => ex.exerciseId);

          // Security: Validate all exercise IDs are proper UUIDs to prevent injection
          if (!exerciseIds.every(id => uuidValidate(id))) {
            throw new Error('Invalid exercise ID format');
          }

          const existingExercises = await exerciseRepository.findBy({ id: In(exerciseIds) });

          // SECURITY: Generic message to prevent ID enumeration
          if (existingExercises.length !== exerciseIds.length) {
            throw new Error('Invalid exercise data provided');
          }

          // Create new WorkoutExercise entries with order
          const workoutExercises = data.exercises.map((exercise, index) => {
            return transactionalEntityManager.create(WorkoutExerciseModel, {
              workoutId: id,
              exerciseId: exercise.exerciseId,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight || 0,
              restTime: exercise.restTime || 60,
              order: index,
            });
          });

          await transactionalEntityManager.save(WorkoutExerciseModel, workoutExercises);
        }
      }

      // Load and return the workout with relations
      const workoutWithExercises = await transactionalEntityManager.findOne(Workout, {
        where: { id },
        relations: ['workoutExercises', 'workoutExercises.exercise'],
      });

      return workoutWithExercises;
    });
  }

  public async deleteWorkout(id: string, userId: string): Promise<{ message: string }> {
    const workoutRepository = AppDataSource.getRepository(Workout);

    // Find and verify ownership
    const workout = await workoutRepository.findOne({ where: { id } });

    if (!workout) {
      throw new Error('Workout not found');
    }

    if (workout.userId !== userId) {
      throw new Error('You do not have permission to delete this workout');
    }

    // Delete workout (WorkoutExercise will cascade delete)
    await workoutRepository.remove(workout);

    return { message: 'Workout deleted successfully' };
  }
}
