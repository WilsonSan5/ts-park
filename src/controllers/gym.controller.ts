import { Request, Response } from 'express';
import * as gymService from '../services/gym.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';

/**
 * Create a new gym
 * POST /api/gyms
 * Gym Owner only
 */
export const createGym = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, description, address, city, phone, email, capacity, equipment, specializedExerciseTypes } = req.body;

  const gym = await gymService.createGym(
    { name, description, address, city, phone, email, capacity, equipment, specializedExerciseTypes },
    req.user!.userId
  );

  return sendCreated(res, 'Gym created successfully', gym);
});

/**
 * Get all approved gyms
 * GET /api/gyms
 */
export const getAllGyms = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const gyms = await gymService.listApprovedGyms();

  return sendSuccess(res, 'Gyms retrieved successfully', {
    count: gyms.length,
    gyms,
  });
});

/**
 * Get gym by ID
 * GET /api/gyms/:id
 */
export const getGymById = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const gym = await gymService.getGymById(id);

  return sendSuccess(res, 'Gym retrieved successfully', gym);
});

/**
 * Update a gym
 * PATCH /api/gyms/:id
 * Owner or Super Admin only
 */
export const updateGym = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const updateData = req.body;

  const gym = await gymService.updateGym(id, updateData, req.user!.userId);

  return sendSuccess(res, 'Gym updated successfully', gym);
});

/**
 * Approve a gym
 * PATCH /api/gyms/:id/approve
 * Super Admin only
 */
export const approveGym = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const gym = await gymService.approveGym(id, req.user!.userId);

  return sendSuccess(res, 'Gym approved successfully', gym);
});

/**
 * Get gyms by owner
 * GET /api/gyms/owner/:ownerId
 * Owner or Super Admin only
 */
export const getGymsByOwner = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ownerId } = req.params;

  const gyms = await gymService.getGymsByOwner(ownerId);

  return sendSuccess(res, 'Gyms retrieved successfully', {
    count: gyms.length,
    gyms,
  });
});
