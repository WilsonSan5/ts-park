import { Router } from 'express';
import * as challengeController from '../controllers/challenge.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All challenge routes require authentication
router.use(authenticateToken);

/**
 * Public routes (all authenticated users)
 */

// Get all challenges (with optional filters)
// GET /api/challenges?type=individual&difficulty=easy&gymId=uuid&isPublic=true
router.get('/', challengeController.getAllChallenges);

// Get user's participations
// GET /api/challenges/my-participations
router.get('/my-participations', challengeController.getUserParticipations);

// Get challenge by ID
// GET /api/challenges/:id
router.get('/:id', challengeController.getChallengeById);

// Get challenge participants
// GET /api/challenges/:id/participants
router.get('/:id/participants', challengeController.getChallengeParticipants);

// Create new challenge
// POST /api/challenges
router.post('/', challengeController.createChallenge);

// Join a challenge
// POST /api/challenges/:id/join
router.post('/:id/join', challengeController.joinChallenge);

// Leave a challenge
// POST /api/challenges/:id/leave
router.post('/:id/leave', challengeController.leaveChallenge);

export default router;
