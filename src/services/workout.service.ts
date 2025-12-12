import { AppDataSource } from '@config/database';
import { Workout } from '../types/index';
import { Workout as WorkoutModel } from '../models/Workout';

export class WorkoutService {
  public async createWorkout(workoutData: Workout) {
    const workoutRepository = AppDataSource.getRepository(WorkoutModel);
    const workout = workoutRepository.create(workoutData);
    const responses = await workoutRepository.save(workout);
    console.log('Workout created:', responses);
    return responses; // Return the created workout data
  }

  public async getAllWorkouts() {
    const workoutRepository = AppDataSource.getRepository(WorkoutModel);
    const workouts = await workoutRepository.find();
    return workouts;
  }
}