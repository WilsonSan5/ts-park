import { AppDataSource } from '@config/database';
import { Workout } from '../types/index';
import { Workout as WorkoutModel } from '../models/Workout';
import { WorkoutExercise as WorkoutExerciseModel } from '../models/WorkoutExercice';
import { Workout } from '../types';

export class WorkoutService {
  public async createWorkout(workoutData: Workout) {
    // Utiliser une transaction pour garantir l'intégrité
    return await AppDataSource.transaction(async (manager) => {
      const workoutRepository = manager.getRepository(WorkoutModel);
      const workoutExerciseRepository = manager.getRepository(WorkoutExerciseModel);

      // 1. Créer et sauvegarder le workout d'abord (sans les exercices)
      const workout = workoutRepository.create({
        name: workoutData.name,
        description: workoutData.description,
        duration: workoutData.duration,
        caloriesBurned: workoutData.caloriesBurned,
        userId: workoutData.userId,
      });
      
      const savedWorkout = await workoutRepository.save(workout);

      // 2. Créer et sauvegarder les WorkoutExercises avec le workoutId
      if (workoutData.exercises && workoutData.exercises.length > 0) {
        const workoutExercises = workoutData.exercises.map((ex, index) => {
          return workoutExerciseRepository.create({
            workoutId: savedWorkout.id,
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight ?? 0,
            restTime: ex.restTime ?? 60,
            order: index,
          });
        });

        await workoutExerciseRepository.save(workoutExercises);
        savedWorkout.workoutExercises = workoutExercises;
      }

      return savedWorkout;
    });
  }

  public async getMyWorkouts(userId: string) {
    const workoutRepository = AppDataSource.getRepository(WorkoutModel);
    return await workoutRepository.find({
      where: { userId },
      relations: ['workoutExercises', 'workoutExercises.exercise']
    });
  }

  public async getWorkoutStatistics(userId: string) {
    const workoutRepository = AppDataSource.getRepository(WorkoutModel);
    const workouts = await workoutRepository.find({ where: { userId } });

    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);
    const totalCaloriesBurned = workouts.reduce((sum, workout) => sum + workout.caloriesBurned, 0);

    return {
      totalWorkouts,
      totalDuration,
      totalCaloriesBurned
    };
  }
}