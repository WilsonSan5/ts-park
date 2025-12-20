import { Request, Response } from 'express';
import * as exerciseService from '../services/exercise.service';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';
import { ExerciseDifficulty } from '../models/Exercise';

/**
 * Create a new exercise
 * POST /api/exercises
 * Super Admin only
 */
export const createExercise = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, description, muscleGroups, difficulty, caloriesPerMinute, instructions, videoUrl, imageUrl } = req.body;

  const exercise = await exerciseService.createExercise(
    { name, description, muscleGroups, difficulty, caloriesPerMinute, instructions, videoUrl, imageUrl },
    req.user!.userId
  );

  return sendCreated(res, 'Exercise created successfully', exercise);
});

/**
 * Get all exercises with optional filters
 * GET /api/exercises
 */
export const getAllExercises = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { difficulty, muscleGroup, search } = req.query;

  const filters: Record<string, unknown> = {};
  if (difficulty) filters.difficulty = difficulty as ExerciseDifficulty;
  if (muscleGroup) filters.muscleGroup = muscleGroup as string;
  if (search) filters.search = search as string;

  const exercises = await exerciseService.getAllExercises(filters);

  return sendSuccess(res, 'Exercises retrieved successfully', {
    count: exercises.length,
    exercises,
  });
});

/**
 * Get exercise by ID
 * GET /api/exercises/:id
 */
export const getExerciseById = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const exercise = await exerciseService.getExerciseById(id);

  return sendSuccess(res, 'Exercise retrieved successfully', exercise);
});

/**
 * Update an exercise
 * PATCH /api/exercises/:id
 * Super Admin only
 */
export const updateExercise = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const updateData = req.body;

  const exercise = await exerciseService.updateExercise(id, updateData, req.user!.userId);

  return sendSuccess(res, 'Exercise updated successfully', exercise);
});

/**
 * Delete an exercise
 * DELETE /api/exercises/:id
 * Super Admin only
 */
export const deleteExercise = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  await exerciseService.deleteExercise(id, req.user!.userId);

  return sendSuccess(res, 'Exercise deleted successfully', null);
});

/**
 * Search exercises
 * GET /api/exercises/search
 */
export const searchExercises = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return sendError(res, 'Search query is required', 400);
  }

  const exercises = await exerciseService.searchExercises(q);

  return sendSuccess(res, 'Search completed successfully', {
    count: exercises.length,
    exercises,
  });
});

/**
 * Restore a soft-deleted exercise
 * POST /api/exercises/:id/restore
 * Super Admin only
 */
export const restoreExercise = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const exercise = await exerciseService.restoreExercise(id, req.user!.userId);

  return sendSuccess(res, 'Exercise restored successfully', exercise);
});

/**
 * Get all deleted exercises (for recovery purposes)
 * GET /api/exercises/deleted
 * Super Admin only
 */
export const getDeletedExercises = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const exercises = await exerciseService.getDeletedExercises(req.user!.userId);

  return sendSuccess(res, 'Deleted exercises retrieved successfully', {
    count: exercises.length,
    exercises,
  });
});
