import { AppDataSource } from '@config/database';
import { Workout as WorkoutDTO } from '../types/index';
import { Workout } from '../models/Workout';

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
    return workouts;
  }
}