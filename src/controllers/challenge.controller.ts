import { Request, Response } from 'express';
import * as challengeService from '../services/challenge.service';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { ChallengeType, ChallengeDifficulty } from '../types';

/**
 * Create a new challenge
 * POST /api/challenges
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
      pointsReward,
      maxParticipants,
      isPublic,
      gymId
    } = req.body;

    // Validation
    if (!title || !description || !type || !difficulty || !objectives || !startDate || !endDate || pointsReward === undefined) {
      return sendError(res, 'Missing required fields', 400);
    }

    if (!Object.values(ChallengeType).includes(type)) {
      return sendError(res, 'Invalid challenge type', 400);
    }

    if (!Object.values(ChallengeDifficulty).includes(difficulty)) {
      return sendError(res, 'Invalid difficulty level', 400);
    }

    if (pointsReward < 0) {
      return sendError(res, 'pointsReward must be non-negative', 400);
    }

    // Validate objectives
    if (typeof objectives !== 'object' || objectives === null) {
      return sendError(res, 'objectives must be an object', 400);
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return sendError(res, 'Invalid date format', 400);
    }

    if (maxParticipants !== undefined && maxParticipants <= 0) {
      return sendError(res, 'maxParticipants must be greater than 0', 400);
    }

    const challenge = await challengeService.createChallenge(
      {
        title,
        description,
        type,
        difficulty,
        objectives,
        startDate: start,
        endDate: end,
        pointsReward,
        maxParticipants,
        isPublic,
        gymId,
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

    const challenges = await challengeService.listChallenges(filters);

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
    const statusCode = error.message === 'Challenge not found' ? 404 :
                      error.message.includes('already participating') ? 409 :
                      error.message.includes('maximum participants') ? 409 :
                      error.message.includes('already ended') ? 409 :
                      500;
    return sendError(res, error.message, statusCode);
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

    await challengeService.leaveChallenge(id, req.user!.userId);

    return sendSuccess(res, 'Successfully left challenge', null);
  } catch (error: any) {
    const statusCode = error.message.includes('not participating') ? 404 :
                      error.message.includes('completed challenge') ? 409 :
                      500;
    return sendError(res, error.message, statusCode);
  }
};

/**
 * Get user participations
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
    return sendError(res, error.message, 500);
  }
};
