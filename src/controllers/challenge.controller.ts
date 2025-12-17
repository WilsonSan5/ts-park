import { Request, Response } from 'express';
import * as challengeService from '../services/challenge.service';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { ChallengeType, ChallengeDifficulty, ChallengeStatus } from '../types';

/**
 * Create a new challenge
 * POST /api/challenges
 * Gym Owner and Super Admin only
 */
export const createChallenge = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      title,
      description,
      type,
      difficulty,
      objectives,
      startDate,
      endDate,
      maxParticipants,
      pointsReward,
      isPublic,
      gymId,
      recommendedExerciseIds
    } = req.body;

    // Validation
    if (!title || !description || !type || !difficulty || !objectives || !startDate || !endDate || pointsReward === undefined || isPublic === undefined) {
      return sendError(res, 'Missing required fields', 400);
    }

    if (!Object.values(ChallengeType).includes(type)) {
      return sendError(res, 'Invalid challenge type', 400);
    }

    if (!Object.values(ChallengeDifficulty).includes(difficulty)) {
      return sendError(res, 'Invalid difficulty level', 400);
    }

    if (pointsReward < 0) {
      return sendError(res, 'Points reward must be non-negative', 400);
    }

    if (maxParticipants !== undefined && maxParticipants <= 0) {
      return sendError(res, 'Max participants must be greater than 0', 400);
    }

    // Validate objectives
    if (typeof objectives !== 'object') {
      return sendError(res, 'Objectives must be an object', 400);
    }

    const challenge = await challengeService.createChallenge(
      {
        title,
        description,
        type,
        difficulty,
        objectives,
        startDate,
        endDate,
        maxParticipants,
        pointsReward,
        isPublic,
        gymId,
        recommendedExerciseIds
      },
      req.user!.userId
    );

    return sendCreated(res, 'Challenge created successfully', challenge);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get all challenges with optional filters
 * GET /api/challenges
 */
export const getAllChallenges = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { type, difficulty, gymId, isPublic } = req.query;

    const filters: any = {};
    if (type) filters.type = type as ChallengeType;
    if (difficulty) filters.difficulty = difficulty as ChallengeDifficulty;
    if (gymId) filters.gymId = gymId as string;
    if (isPublic !== undefined) filters.isPublic = isPublic === 'true';

    const challenges = await challengeService.getAllChallenges(filters);

    return sendSuccess(res, 'Challenges retrieved successfully', {
      count: challenges.length,
      challenges,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get challenge by ID
 * GET /api/challenges/:id
 */
export const getChallengeById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const challenge = await challengeService.getChallengeById(id);

    return sendSuccess(res, 'Challenge retrieved successfully', challenge);
  } catch (error: any) {
    return sendError(res, error.message, error.message === 'Challenge not found' ? 404 : 500);
  }
};

/**
 * Update a challenge
 * PATCH /api/challenges/:id
 * Creator or Super Admin only
 */
export const updateChallenge = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate type if provided
    if (updateData.type && !Object.values(ChallengeType).includes(updateData.type)) {
      return sendError(res, 'Invalid challenge type', 400);
    }

    // Validate difficulty if provided
    if (updateData.difficulty && !Object.values(ChallengeDifficulty).includes(updateData.difficulty)) {
      return sendError(res, 'Invalid difficulty level', 400);
    }

    // Validate status if provided
    if (updateData.status && !Object.values(ChallengeStatus).includes(updateData.status)) {
      return sendError(res, 'Invalid status', 400);
    }

    // Validate pointsReward if provided
    if (updateData.pointsReward !== undefined && updateData.pointsReward < 0) {
      return sendError(res, 'Points reward must be non-negative', 400);
    }

    // Validate maxParticipants if provided
    if (updateData.maxParticipants !== undefined && updateData.maxParticipants <= 0) {
      return sendError(res, 'Max participants must be greater than 0', 400);
    }

    const challenge = await challengeService.updateChallenge(id, updateData, req.user!.userId);

    return sendSuccess(res, 'Challenge updated successfully', challenge);
  } catch (error: any) {
    if (error.message === 'Challenge not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message === 'You can only update your own challenges') {
      return sendError(res, error.message, 403);
    }
    return sendError(res, error.message, 500);
  }
};

/**
 * Delete a challenge
 * DELETE /api/challenges/:id
 * Creator or Super Admin only
 */
export const deleteChallenge = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    await challengeService.deleteChallenge(id, req.user!.userId);

    return sendSuccess(res, 'Challenge deleted successfully', null);
  } catch (error: any) {
    if (error.message === 'Challenge not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message === 'You can only delete your own challenges') {
      return sendError(res, error.message, 403);
    }
    return sendError(res, error.message, 500);
  }
};

/**
 * Join a challenge
 * POST /api/challenges/:id/join
 */
export const joinChallenge = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const participation = await challengeService.joinChallenge(id, req.user!.userId);

    return sendCreated(res, 'Successfully joined challenge', participation);
  } catch (error: any) {
    if (error.message === 'Challenge not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('already joined') || error.message.includes('maximum participants')) {
      return sendError(res, error.message, 400);
    }
    return sendError(res, error.message, 500);
  }
};

/**
 * Leave a challenge
 * POST /api/challenges/:id/leave
 */
export const leaveChallenge = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const participation = await challengeService.leaveChallenge(id, req.user!.userId);

    return sendSuccess(res, 'Successfully left challenge', participation);
  } catch (error: any) {
    if (error.message === 'You are not participating in this challenge') {
      return sendError(res, error.message, 400);
    }
    return sendError(res, error.message, 500);
  }
};

/**
 * Get challenge participants
 * GET /api/challenges/:id/participants
 */
export const getChallengeParticipants = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const participants = await challengeService.getChallengeParticipants(id);

    return sendSuccess(res, 'Participants retrieved successfully', {
      count: participants.length,
      participants,
    });
  } catch (error: any) {
    if (error.message === 'Challenge not found') {
      return sendError(res, error.message, 404);
    }
    return sendError(res, error.message, 500);
  }
};

/**
 * Get user's participations
 * GET /api/challenges/my-participations
 */
export const getUserParticipations = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const participations = await challengeService.getUserParticipations(req.user!.userId);

    return sendSuccess(res, 'Participations retrieved successfully', {
      count: participations.length,
      participations,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};
