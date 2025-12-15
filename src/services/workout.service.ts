import { AppDataSource } from '@config/database';
import { Workout } from '../types/index';
import { Workout as WorkoutModel } from '../models/Workout';
import { WorkoutExercise as WorkoutExerciseModel } from '../models/WorkoutExercice';
import { Workout } from '../types';

export class WorkoutService {
  public async createWorkout(workoutData: Workout) {
    const workoutRepository = AppDataSource.getRepository(WorkoutModel);
    const workout = workoutRepository.create(workoutData);
    const responses = await workoutRepository.save(workout);
    return responses; // Return the created workout data
  }

  public async getMyWorkouts(userId: string) {
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