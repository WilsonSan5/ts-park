import { Router } from 'express';
import { WorkoutController } from '../controllers/workout.controller';
import { WorkoutService } from '../services/workout.service';
const workoutService = new WorkoutService();
const workoutController = new WorkoutController(workoutService);

export default workoutController.buildRouter();