import { Request, Response } from 'express';
import * as gymService from '../services/gym.service';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

/**
 * Create a new gym
 * POST /api/gyms
 * Gym Owner only
 */
export const createGym = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name, description, address, city, phone, email, capacity, equipment, specializedExerciseTypes } = req.body;

    // Validation
    if (!name || !description || !address || !city || !phone || !email || !capacity || !equipment) {
      return sendError(res, 'Missing required fields', 400);
    }

    if (!Array.isArray(equipment) || equipment.length === 0) {
      return sendError(res, 'equipment must be a non-empty array', 400);
    }

    if (capacity <= 0) {
      return sendError(res, 'capacity must be greater than 0', 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Invalid email format', 400);
    }

    const gym = await gymService.createGym(
      { name, description, address, city, phone, email, capacity, equipment, specializedExerciseTypes },
      req.user!.userId
    );

    return sendCreated(res, 'Gym created successfully', gym);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get all approved gyms
 * GET /api/gyms
 */
export const getAllGyms = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const gyms = await gymService.listApprovedGyms();

    return sendSuccess(res, 'Gyms retrieved successfully', {
      count: gyms.length,
      gyms,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get gym by ID
 * GET /api/gyms/:id
 */
export const getGymById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const gym = await gymService.getGymById(id);

    return sendSuccess(res, 'Gym retrieved successfully', gym);
  } catch (error: any) {
    return sendError(res, error.message, error.message === 'Gym not found' ? 404 : 500);
  }
};

/**
 * Update a gym
 * PATCH /api/gyms/:id
 * Owner or Super Admin only
 */
export const updateGym = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate equipment if provided
    if (updateData.equipment && (!Array.isArray(updateData.equipment) || updateData.equipment.length === 0)) {
      return sendError(res, 'equipment must be a non-empty array', 400);
    }

    // Validate capacity if provided
    if (updateData.capacity !== undefined && updateData.capacity <= 0) {
      return sendError(res, 'capacity must be greater than 0', 400);
    }

    // Validate email if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return sendError(res, 'Invalid email format', 400);
      }
    }

    const gym = await gymService.updateGym(id, updateData, req.user!.userId);

    return sendSuccess(res, 'Gym updated successfully', gym);
  } catch (error: any) {
    const statusCode = error.message === 'Gym not found' ? 404 :
                      error.message.includes('Only the gym owner') ? 403 :
                      500;
    return sendError(res, error.message, statusCode);
  }
};

/**
 * Approve a gym
 * PATCH /api/gyms/:id/approve
 * Super Admin only
 */
export const approveGym = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const gym = await gymService.approveGym(id, req.user!.userId);

    return sendSuccess(res, 'Gym approved successfully', gym);
  } catch (error: any) {
    const statusCode = error.message === 'Gym not found' ? 404 :
                      error.message.includes('Only super administrators') ? 403 :
                      500;
    return sendError(res, error.message, statusCode);
  }
};

/**
 * Get gyms by owner
 * GET /api/gyms/owner/:ownerId
 * Owner or Super Admin only
 */
export const getGymsByOwner = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { ownerId } = req.params;

    const gyms = await gymService.getGymsByOwner(ownerId);

    return sendSuccess(res, 'Gyms retrieved successfully', {
      count: gyms.length,
      gyms,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};
