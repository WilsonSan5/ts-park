import { Request, Response, Router } from 'express';
import { WorkoutService } from '../services/workout.service';
import { Workout, WorkoutExercise } from '../types/index';
import { authenticateToken } from '../middleware/auth.middleware';


export class WorkoutController {
  readonly workoutService: WorkoutService;

  constructor(workoutService: WorkoutService) {
    this.workoutService = workoutService;
  }

  buildRouter(): Router {
    const router = Router();
    router.use(authenticateToken);
    router.post('/', this.createWorkout.bind(this));
    router.get('/', this.getMyWorkouts.bind(this));
    router.get('/statistics', this.statistics.bind(this));
    return router;
  }

  async createWorkout(req: Request, res: Response) {

    try {
      const { name, description, duration, exercises } = req.body;
      const userId = req.user!.userId;
      
      const workoutData: Workout = {
        name,
        description,
        duration,
        caloriesBurned: 0,
        createdAt: new Date(),
        exercises: exercises || [],  // S'assurer que c'est un tableau
        userId: userId
      };

      const workout = await this.workoutService.createWorkout(workoutData);
      return res.status(201).json(workout);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to create workout' });
    }
  }

  async getMyWorkouts(req: Request, res: Response) {
    try {
      const userId  =  req.user!.userId;
      const workouts = await this.workoutService.getMyWorkouts(userId);
      return res.status(200).json(workouts);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to retrieve workouts' });
    }
  }

  async statistics(req: Request, res: Response) {
    try {
      const userId  =  req.user!.userId;
      const stats = await this.workoutService.getWorkoutStatistics(userId);
      return res.status(200).json(stats);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to retrieve workout statistics' });
    }
  }
}