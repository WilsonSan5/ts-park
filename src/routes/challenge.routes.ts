import { Router } from 'express';
import * as challengeController from '../controllers/challenge.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../types';

const router = Router();

// All challenge routes require authentication
router.use(authenticateToken);

/**
 * Challenge Routes
 *
 * PUBLIC ROUTES (all authenticated users):
 * - GET    /api/challenges                 → getAllChallenges (with optional filters)
 * - GET    /api/challenges/my-participations → getUserParticipations
 * - GET    /api/challenges/:id             → getChallengeById
 * - GET    /api/challenges/:id/participants → getChallengeParticipants
 * - POST   /api/challenges/:id/join        → joinChallenge
 * - POST   /api/challenges/:id/leave       → leaveChallenge
 *
 * RESTRICTED ROUTES (gym_owner and super_admin):
 * - POST   /api/challenges                 → createChallenge
 * - PATCH  /api/challenges/:id             → updateChallenge (ownership verified in service)
 * - DELETE /api/challenges/:id             → deleteChallenge (ownership verified in service)
 */

// Get all challenges (with optional filters)
// GET /api/challenges?type=individual&difficulty=easy&gymId=uuid&isPublic=true
router.get('/', challengeController.getAllChallenges);

// Get user's participations (must be before /:id to avoid route conflicts)
// GET /api/challenges/my-participations
router.get('/my-participations', challengeController.getUserParticipations);

// Get challenge by ID
// GET /api/challenges/:id
router.get('/:id', challengeController.getChallengeById);

// Get challenge participants
// GET /api/challenges/:id/participants
router.get('/:id/participants', challengeController.getChallengeParticipants);

// Join a challenge
// POST /api/challenges/:id/join
router.post('/:id/join', challengeController.joinChallenge);

// Leave a challenge
// POST /api/challenges/:id/leave
router.post('/:id/leave', challengeController.leaveChallenge);

/**
 * Restricted routes (gym_owner and super_admin)
 */

// Create new challenge
// POST /api/challenges
router.post('/', requireRole([UserRole.GYM_OWNER, UserRole.SUPER_ADMIN]), challengeController.createChallenge);

// Update challenge (ownership checked in service)
// PATCH /api/challenges/:id
router.patch('/:id', challengeController.updateChallenge);

// Delete challenge (ownership checked in service)
// DELETE /api/challenges/:id
router.delete('/:id', challengeController.deleteChallenge);

export default router;
