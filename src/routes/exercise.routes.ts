import { Router } from 'express';
import * as exerciseController from '../controllers/exercise.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateDTO, validateUUIDParam, ValidationSource } from '../middleware/validate.middleware';
import { CreateExerciseDTO, UpdateExerciseDTO, ExerciseQueryDTO, SearchDTO } from '../dtos';
import { UserRole } from '../types';

const router = Router();

// All exercise routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/exercises:
 *   get:
 *     summary: Get all exercises
 *     description: Retrieve all exercises with optional filters
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: muscleGroup
 *         schema:
 *           type: string
 *           enum: [chest, back, shoulders, arms, legs, core, full_body]
 *         description: Filter by muscle group
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name and description
 *     responses:
 *       200:
 *         description: Exercises retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Exercise'
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new exercise
 *     description: Create a new exercise in the library (super_admin only)
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExerciseDTO'
 *           example:
 *             name: "Barbell Squat"
 *             description: "A compound exercise targeting the quadriceps, hamstrings, and glutes"
 *             muscleGroup: "legs"
 *             difficulty: "intermediate"
 *             equipmentRequired: "Barbell, Squat Rack"
 *             instructions: "1. Stand with feet shoulder-width apart..."
 *             caloriesPerMinute: 8.5
 *     responses:
 *       201:
 *         description: Exercise created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - requires super_admin role
 */

/**
 * @swagger
 * /api/exercises/search:
 *   get:
 *     summary: Search exercises
 *     description: Search exercises by keyword
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "cardio"
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Search query required
 */

/**
 * @swagger
 * /api/exercises/{id}:
 *   get:
 *     summary: Get exercise by ID
 *     description: Retrieve a specific exercise by its ID
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exercise ID
 *     responses:
 *       200:
 *         description: Exercise retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Exercise'
 *       404:
 *         description: Exercise not found
 *
 *   patch:
 *     summary: Update exercise
 *     description: Update an existing exercise (super_admin only)
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               muscleGroup:
 *                 type: string
 *               difficulty:
 *                 type: string
 *               instructions:
 *                 type: string
 *     responses:
 *       200:
 *         description: Exercise updated successfully
 *       403:
 *         description: Forbidden - requires super_admin role
 *       404:
 *         description: Exercise not found
 *
 *   delete:
 *     summary: Delete exercise
 *     description: Delete an existing exercise (super_admin only)
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Exercise deleted successfully
 *       403:
 *         description: Forbidden - requires super_admin role
 *       404:
 *         description: Exercise not found
 */

// Get all exercises (with optional filters)
// GET /api/exercises?difficulty=beginner&muscleGroup=chest&search=push
router.get('/', validateDTO(ExerciseQueryDTO, ValidationSource.QUERY), exerciseController.getAllExercises);

// Search exercises
// GET /api/exercises/search?q=cardio
router.get('/search', validateDTO(SearchDTO, ValidationSource.QUERY), exerciseController.searchExercises);

// Get all deleted exercises (for recovery purposes) - Must be before /:id to avoid route conflict
// GET /api/exercises/deleted
router.get(
  '/deleted',
  requireRole([UserRole.SUPER_ADMIN]),
  exerciseController.getDeletedExercises
);

// Get exercise by ID
// GET /api/exercises/:id
router.get('/:id', validateUUIDParam('id'), exerciseController.getExerciseById);

/**
 * Super Admin only routes
 */

// Create new exercise
// POST /api/exercises
router.post(
  '/',
  requireRole([UserRole.SUPER_ADMIN]),
  validateDTO(CreateExerciseDTO),
  exerciseController.createExercise
);

// Update exercise
// PATCH /api/exercises/:id
router.patch(
  '/:id',
  requireRole([UserRole.SUPER_ADMIN]),
  validateUUIDParam('id'),
  validateDTO(UpdateExerciseDTO),
  exerciseController.updateExercise
);

// Delete exercise (soft delete)
// DELETE /api/exercises/:id
router.delete(
  '/:id',
  requireRole([UserRole.SUPER_ADMIN]),
  validateUUIDParam('id'),
  exerciseController.deleteExercise
);

// Restore a soft-deleted exercise
// POST /api/exercises/:id/restore
router.post(
  '/:id/restore',
  requireRole([UserRole.SUPER_ADMIN]),
  validateUUIDParam('id'),
  exerciseController.restoreExercise
);

export default router;
