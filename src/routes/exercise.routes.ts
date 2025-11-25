import { Router } from 'express';
import * as exerciseController from '../controllers/exercise.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../types';

const router = Router();

// All exercise routes require authentication
router.use(authenticateToken);

/**
 * Public routes (all authenticated users)
 */

// Get all exercises (with optional filters)
// GET /api/exercises?difficulty=beginner&muscleGroup=chest&search=push
router.get('/', exerciseController.getAllExercises);

// Search exercises
// GET /api/exercises/search?q=cardio
router.get('/search', exerciseController.searchExercises);

// Get exercise by ID
// GET /api/exercises/:id
router.get('/:id', exerciseController.getExerciseById);

/**
 * Super Admin only routes
 */

// Create new exercise
// POST /api/exercises
router.post('/', requireRole([UserRole.SUPER_ADMIN]), exerciseController.createExercise);

// Update exercise
// PATCH /api/exercises/:id
router.patch('/:id', requireRole([UserRole.SUPER_ADMIN]), exerciseController.updateExercise);

// Delete exercise
// DELETE /api/exercises/:id
router.delete('/:id', requireRole([UserRole.SUPER_ADMIN]), exerciseController.deleteExercise);

export default router;
