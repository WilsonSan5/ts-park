import { Request, Response, Router } from 'express';
import { WorkoutService } from '../services/workout.service';
import { Workout } from '../types/index';

export class WorkoutController {
  readonly workoutService: WorkoutService;

  constructor(workoutService: WorkoutService) {
    this.workoutService = workoutService;
  }

  async createWorkout(req: Request, res: Response) {
    try {
      const { name, description, difficulty, duration, exercises, caloriesBurned, userId } = req.body;
      const workoutData: Workout = {
        name,
        description,
        difficulty,
        duration,
        caloriesBurned,
        createdAt: new Date(),
        exercises,
        userId,
      };

      const workout = await this.workoutService.createWorkout(workoutData);
      return res.status(201).json(workout);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to create workout' });
    }
  }

  async getAllWorkouts(req: Request, res: Response) {
    try {
      // const workouts = await this.workoutService.getAllWorkouts();
      return res.status(200).json({ message: 'ok' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to retrieve workouts' });
    }
  }
  
  buildRouter(): Router {
    const router = Router();
    router.post('/', this.createWorkout.bind(this));
    router.get('/', this.getAllWorkouts.bind(this));
    return router;
  }
}