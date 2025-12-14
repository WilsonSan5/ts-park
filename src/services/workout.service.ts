import { AppDataSource } from '@config/database';
import { Workout as WorkoutModel } from '../models/Workout';

export class WorkoutService {
  public async createWorkout(workoutData: any) {
    const workoutRepository = AppDataSource.getRepository(WorkoutModel);
    
    const workout = workoutRepository.create({
      name: workoutData.name,
      description: workoutData.description,
      duration: workoutData.duration,
      caloriesBurned: workoutData.caloriesBurned || 0,
      userId: workoutData.userId,
      createdAt: new Date()
      // Ne pas inclure createdAt (auto) ni exercises (pas encore implémenté)
    });
    
    console.log('Workout avant save:', workout);
    const saved = await workoutRepository.save(workout);
    console.log('Workout après save:', saved);
    
    return saved;
  }

  public async getAllWorkouts() {
    const workoutRepository = AppDataSource.getRepository(WorkoutModel);
    return workoutRepository.find();
  }
}