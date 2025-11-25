import { Request, Response } from 'express';
import * as exerciseService from '../services/exercise.service';
import { sendSuccess, sendError } from '../utils/response';
import { ExerciseDifficulty } from '../models/Exercise';

/**
 * Create a new exercise
 * POST /api/exercises
 * Super Admin only
 */
export const createExercise = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name, description, muscleGroups, difficulty, caloriesPerMinute, instructions, videoUrl, imageUrl } = req.body;

    // Validation
    if (!name || !description || !muscleGroups || !difficulty || !caloriesPerMinute) {
      return sendError(res, 'Missing required fields', 400);
    }

    if (!Array.isArray(muscleGroups) || muscleGroups.length === 0) {
      return sendError(res, 'muscleGroups must be a non-empty array', 400);
    }

    if (!Object.values(ExerciseDifficulty).includes(difficulty)) {
      return sendError(res, 'Invalid difficulty level', 400);
    }

    if (caloriesPerMinute <= 0) {
      return sendError(res, 'caloriesPerMinute must be greater than 0', 400);
    }

    const exercise = await exerciseService.createExercise(
      { name, description, muscleGroups, difficulty, caloriesPerMinute, instructions, videoUrl, imageUrl },
      req.user!.userId
    );

    return sendSuccess(res, 'Exercise created successfully', exercise, 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get all exercises with optional filters
 * GET /api/exercises
 */
export const getAllExercises = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { difficulty, muscleGroup, search } = req.query;

    const filters: any = {};
    if (difficulty) filters.difficulty = difficulty as ExerciseDifficulty;
    if (muscleGroup) filters.muscleGroup = muscleGroup as string;
    if (search) filters.search = search as string;

    const exercises = await exerciseService.getAllExercises(filters);

    return sendSuccess(res, 'Exercises retrieved successfully', {
      count: exercises.length,
      exercises,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get exercise by ID
 * GET /api/exercises/:id
 */
export const getExerciseById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const exercise = await exerciseService.getExerciseById(id);

    return sendSuccess(res, 'Exercise retrieved successfully', exercise);
  } catch (error: any) {
    return sendError(res, error.message, error.message === 'Exercise not found' ? 404 : 500);
  }
};

/**
 * Update an exercise
 * PATCH /api/exercises/:id
 * Super Admin only
 */
export const updateExercise = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate difficulty if provided
    if (updateData.difficulty && !Object.values(ExerciseDifficulty).includes(updateData.difficulty)) {
      return sendError(res, 'Invalid difficulty level', 400);
    }

    // Validate muscleGroups if provided
    if (updateData.muscleGroups && (!Array.isArray(updateData.muscleGroups) || updateData.muscleGroups.length === 0)) {
      return sendError(res, 'muscleGroups must be a non-empty array', 400);
    }

    // Validate caloriesPerMinute if provided
    if (updateData.caloriesPerMinute !== undefined && updateData.caloriesPerMinute <= 0) {
      return sendError(res, 'caloriesPerMinute must be greater than 0', 400);
    }

    const exercise = await exerciseService.updateExercise(id, updateData, req.user!.userId);

    return sendSuccess(res, 'Exercise updated successfully', exercise);
  } catch (error: any) {
    return sendError(res, error.message, error.message === 'Exercise not found' ? 404 : 500);
  }
};

/**
 * Delete an exercise
 * DELETE /api/exercises/:id
 * Super Admin only
 */
export const deleteExercise = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    await exerciseService.deleteExercise(id, req.user!.userId);

    return sendSuccess(res, 'Exercise deleted successfully', null);
  } catch (error: any) {
    return sendError(res, error.message, error.message === 'Exercise not found' ? 404 : 500);
  }
};

/**
 * Search exercises
 * GET /api/exercises/search
 */
export const searchExercises = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return sendError(res, 'Search query is required', 400);
    }

    const exercises = await exerciseService.searchExercises(q);

    return sendSuccess(res, 'Search completed successfully', {
      count: exercises.length,
      exercises,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};
