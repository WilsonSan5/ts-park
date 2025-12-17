import { AppDataSource } from '@config/database';
import { Workout as WorkoutDTO } from '../types/index';
import { Workout } from '../models/Workout';
import { Workout } from '../types/index';
import { Workout as WorkoutModel } from '../models/Workout';
import { WorkoutExercise as WorkoutExerciseModel } from '../models/WorkoutExercice';
import { Workout } from '../types';

export class WorkoutService {
  public async createWorkout(workoutData: Omit<WorkoutDTO, 'exercises' | 'createdAt'> & { exerciseIds?: string[] }) {
    const workoutRepository = AppDataSource.getRepository(Workout);
    const workout = workoutRepository.create({
      name: workoutData.name,
      description: workoutData.description,
      duration: workoutData.duration,
      caloriesBurned: workoutData.caloriesBurned,
      userId: workoutData.userId,
    });
    const responses = await workoutRepository.save(workout);
    return responses; // Return the created workout data
  }

  public async getMyWorkouts(userId: string) {
    const workoutRepository = AppDataSource.getRepository(Workout);
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