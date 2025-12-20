import { Request, Response } from 'express';
import * as challengeService from '../services/challenge.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';

/**
 * Create a new challenge
 * POST /api/challenges
 * Gym Owner and Super Admin only
 */
export const createChallenge = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
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
});

/**
 * Get all challenges with optional filters
 * GET /api/challenges
 */
export const getAllChallenges = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { type, difficulty, gymId, isPublic } = req.query;

  const filters: Record<string, unknown> = {};
  if (type) filters.type = type as string;
  if (difficulty) filters.difficulty = difficulty as string;
  if (gymId) filters.gymId = gymId as string;
  if (isPublic !== undefined) filters.isPublic = isPublic === 'true';

  const challenges = await challengeService.getAllChallenges(filters);

  return sendSuccess(res, 'Challenges retrieved successfully', {
    count: challenges.length,
    challenges,
  });
});

/**
 * Get challenge by ID
 * GET /api/challenges/:id
 */
export const getChallengeById = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const challenge = await challengeService.getChallengeById(id);

  return sendSuccess(res, 'Challenge retrieved successfully', challenge);
});

/**
 * Update a challenge
 * PATCH /api/challenges/:id
 * Creator or Super Admin only
 */
export const updateChallenge = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const updateData = req.body;

  const challenge = await challengeService.updateChallenge(id, updateData, req.user!.userId);

  return sendSuccess(res, 'Challenge updated successfully', challenge);
});

/**
 * Delete a challenge
 * DELETE /api/challenges/:id
 * Creator or Super Admin only
 */
export const deleteChallenge = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  await challengeService.deleteChallenge(id, req.user!.userId);

  return sendSuccess(res, 'Challenge deleted successfully', null);
});

/**
 * Join a challenge
 * POST /api/challenges/:id/join
 */
export const joinChallenge = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const participation = await challengeService.joinChallenge(id, req.user!.userId);

  return sendCreated(res, 'Successfully joined challenge', participation);
});

/**
 * Leave a challenge
 * POST /api/challenges/:id/leave
 */
export const leaveChallenge = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const participation = await challengeService.leaveChallenge(id, req.user!.userId);

  return sendSuccess(res, 'Successfully left challenge', participation);
});

/**
 * Get challenge participants
 * GET /api/challenges/:id/participants
 */
export const getChallengeParticipants = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const participants = await challengeService.getChallengeParticipants(id);

  return sendSuccess(res, 'Participants retrieved successfully', {
    count: participants.length,
    participants,
  });
});

/**
 * Get user's participations
 * GET /api/challenges/my-participations
 */
export const getUserParticipations = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const participations = await challengeService.getUserParticipations(req.user!.userId);

  return sendSuccess(res, 'Participations retrieved successfully', {
    count: participations.length,
    participations,
  });
});

/**
 * Start a challenge (activate a draft challenge)
 * POST /api/challenges/:id/start
 * Creator or Super Admin only
 */
export const startChallenge = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const challenge = await challengeService.startChallenge(id, req.user!.userId);

  return sendSuccess(res, 'Challenge activated successfully', challenge);
});

/**
 * Cancel a challenge
 * POST /api/challenges/:id/cancel
 * Creator or Super Admin only
 */
export const cancelChallenge = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const result = await challengeService.cancelChallenge(id, req.user!.userId);

  return sendSuccess(res, 'Challenge cancelled successfully. All participants have been notified.', {
    challenge: result.challenge,
    participantsAffected: result.participantsAffected,
  });
});

/**
 * Complete a challenge (finalize results and award points)
 * POST /api/challenges/:id/complete
 * Creator or Super Admin only
 */
export const completeChallenge = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const result = await challengeService.completeChallenge(id, req.user!.userId);

  return sendSuccess(res, 'Challenge completed successfully. Participant results have been finalized.', {
    challenge: result.challenge,
    statistics: result.statistics,
  });
});

/**
 * Get all deleted challenges (for recovery)
 * GET /api/challenges/deleted
 * Super Admin only
 */
export const getDeletedChallenges = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const challenges = await challengeService.getDeletedChallenges(req.user!.userId);

  return sendSuccess(res, 'Deleted challenges retrieved successfully', { challenges });
});

/**
 * Restore a soft-deleted challenge
 * POST /api/challenges/:id/restore
 * Creator or Super Admin only
 */
export const restoreChallenge = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const challenge = await challengeService.restoreChallenge(id, req.user!.userId);

  return sendSuccess(res, 'Challenge restored successfully', { challenge });
});
