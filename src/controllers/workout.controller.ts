import { Request, Response, Router } from 'express';
import { WorkoutService } from '../services/workout.service';
import { Workout } from '../types/index';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateDTO, validateUUIDParam, ValidationSource } from '../middleware/validate.middleware';
import { CreateWorkoutDTO, UpdateWorkoutDTO, WorkoutQueryDTO } from '../dtos';
import { sendSuccess, sendCreated } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';

/**
 * @swagger
 * /api/workouts:
 *   post:
 *     summary: Create a new workout
 *     description: Log a new workout with optional exercises
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkoutDTO'
 *           example:
 *             name: "Morning HIIT Session"
 *             description: "High intensity interval training"
 *             duration: 45
 *             caloriesBurned: 400
 *             exercises:
 *               - exerciseId: "550e8400-e29b-41d4-a716-446655440001"
 *                 sets: 3
 *                 reps: 12
 *                 weight: 20
 *                 restTime: 60
 *     responses:
 *       201:
 *         description: Workout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Workout created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Workout'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     summary: Get my workouts
 *     description: Retrieve all workouts for the authenticated user with pagination
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, duration, caloriesBurned, name]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: Workouts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/workouts/statistics:
 *   get:
 *     summary: Get workout statistics
 *     description: Retrieve comprehensive workout statistics for the authenticated user
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/WorkoutStatistics'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/workouts/{id}:
 *   get:
 *     summary: Get workout by ID
 *     description: Retrieve a specific workout by its ID
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Workout ID
 *     responses:
 *       200:
 *         description: Workout retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Workout'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not your workout
 *       404:
 *         description: Workout not found
 *
 *   patch:
 *     summary: Update workout
 *     description: Update an existing workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Workout ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Workout Name"
 *               description:
 *                 type: string
 *               duration:
 *                 type: integer
 *               caloriesBurned:
 *                 type: integer
 *               exercises:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/WorkoutExercise'
 *     responses:
 *       200:
 *         description: Workout updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Workout not found
 *
 *   delete:
 *     summary: Delete workout
 *     description: Delete an existing workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Workout ID
 *     responses:
 *       200:
 *         description: Workout deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Workout not found
 */

export class WorkoutController {
  readonly workoutService: WorkoutService;

  constructor(workoutService: WorkoutService) {
    this.workoutService = workoutService;
  }

  buildRouter(): Router {
    const router = Router();
    router.use(authenticateToken);

    // Create workout
    router.post('/', validateDTO(CreateWorkoutDTO), asyncHandler(this.createWorkout.bind(this)));

    // Get my workouts with pagination
    router.get('/', validateDTO(WorkoutQueryDTO, ValidationSource.QUERY), asyncHandler(this.getMyWorkouts.bind(this)));

    // Get workout statistics
    router.get('/statistics', asyncHandler(this.statistics.bind(this)));

    // Get workout by ID
    router.get('/:id', validateUUIDParam('id'), asyncHandler(this.getWorkoutById.bind(this)));

    // Update workout
    router.patch('/:id', validateUUIDParam('id'), validateDTO(UpdateWorkoutDTO), asyncHandler(this.updateWorkout.bind(this)));

    // Delete workout
    router.delete('/:id', validateUUIDParam('id'), asyncHandler(this.deleteWorkout.bind(this)));

    return router;
  }

  async createWorkout(req: Request, res: Response): Promise<Response> {
    const { name, description, duration, caloriesBurned, exercises } = req.body;
    const userId = req.user!.userId;

    const workoutData: Workout = {
      name,
      description,
      duration,
      caloriesBurned: caloriesBurned || 0,
      createdAt: new Date(),
      exercises: exercises || [],
      userId: userId
    };

    const workout = await this.workoutService.createWorkout(workoutData);
    return sendCreated(res, 'Workout created successfully', workout);
  }

  async getMyWorkouts(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.userId;

    // Query params are already validated and transformed by DTO
    const pagination = {
      page: req.query.page as number | undefined,
      limit: req.query.limit as number | undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as 'ASC' | 'DESC' | undefined,
    };

    const result = await this.workoutService.getMyWorkouts(userId, pagination);
    return sendSuccess(res, 'Workouts retrieved successfully', result);
  }

  async statistics(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.userId;
    const stats = await this.workoutService.getWorkoutStatistics(userId);
    return sendSuccess(res, 'Workout statistics retrieved successfully', stats);
  }

  async getWorkoutById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const userId = req.user!.userId;

    const workout = await this.workoutService.getWorkoutById(id, userId);
    return sendSuccess(res, 'Workout retrieved successfully', workout);
  }

  async updateWorkout(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { name, description, duration, caloriesBurned, exercises } = req.body;
    const userId = req.user!.userId;

    const updateData: Partial<Workout> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration;
    if (caloriesBurned !== undefined) updateData.caloriesBurned = caloriesBurned;
    if (exercises !== undefined) updateData.exercises = exercises;

    const workout = await this.workoutService.updateWorkout(id, updateData, userId);
    return sendSuccess(res, 'Workout updated successfully', workout);
  }

  async deleteWorkout(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = await this.workoutService.deleteWorkout(id, userId);
    return sendSuccess(res, 'Workout deleted successfully', result);
  }
}
