import { Router } from 'express';
import * as challengeController from '../controllers/challenge.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateDTO, validateUUIDParam, ValidationSource } from '../middleware/validate.middleware';
import { CreateChallengeDTO, UpdateChallengeDTO, ChallengeQueryDTO } from '../dtos';
import { UserRole } from '../types';

const router = Router();

// All challenge routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/challenges:
 *   get:
 *     summary: Get all challenges
 *     description: Retrieve all challenges with optional filters
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [individual, team, gym]
 *         description: Filter by challenge type
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty
 *       - in: query
 *         name: gymId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by gym
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Filter by public/private
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, completed, cancelled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Challenges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Challenge'
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new challenge
 *     description: Create a new fitness challenge (gym_owner or super_admin only)
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChallengeDTO'
 *           example:
 *             title: "30-Day Cardio Challenge"
 *             description: "Complete 30 cardio workouts in 30 days"
 *             startDate: "2025-01-01"
 *             endDate: "2025-01-31"
 *             type: "individual"
 *             difficulty: "intermediate"
 *             isPublic: true
 *             maxParticipants: 100
 *             pointsReward: 500
 *             objectives:
 *               totalWorkouts: 30
 *               totalCalories: 10000
 *     responses:
 *       201:
 *         description: Challenge created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires gym_owner or super_admin role
 */

/**
 * @swagger
 * /api/challenges/my-participations:
 *   get:
 *     summary: Get my challenge participations
 *     description: Retrieve all challenges the authenticated user is participating in
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Participations retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/challenges/{id}:
 *   get:
 *     summary: Get challenge by ID
 *     description: Retrieve a specific challenge by its ID
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Challenge ID
 *     responses:
 *       200:
 *         description: Challenge retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Challenge'
 *       404:
 *         description: Challenge not found
 *
 *   patch:
 *     summary: Update challenge
 *     description: Update an existing challenge (owner or super_admin only)
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *               maxParticipants:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Challenge updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Challenge not found
 *
 *   delete:
 *     summary: Delete challenge
 *     description: Delete an existing challenge (owner or super_admin only)
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Challenge deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Challenge not found
 */

/**
 * @swagger
 * /api/challenges/{id}/participants:
 *   get:
 *     summary: Get challenge participants
 *     description: Retrieve all participants of a challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Participants retrieved successfully
 *       404:
 *         description: Challenge not found
 */

/**
 * @swagger
 * /api/challenges/{id}/join:
 *   post:
 *     summary: Join a challenge
 *     description: Join an active challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Joined challenge successfully
 *       400:
 *         description: Already participating or challenge full
 *       404:
 *         description: Challenge not found
 */

/**
 * @swagger
 * /api/challenges/{id}/leave:
 *   post:
 *     summary: Leave a challenge
 *     description: Leave a challenge you're participating in
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Left challenge successfully
 *       400:
 *         description: Not participating in this challenge
 *       404:
 *         description: Challenge not found
 */

/**
 * @swagger
 * /api/challenges/{id}/start:
 *   post:
 *     summary: Start a challenge
 *     description: Activate a draft challenge (creator or super_admin only)
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Challenge activated successfully
 *       400:
 *         description: Challenge is already active or cannot be activated
 *       403:
 *         description: Not authorized to start this challenge
 *       404:
 *         description: Challenge not found
 */

/**
 * @swagger
 * /api/challenges/{id}/cancel:
 *   post:
 *     summary: Cancel a challenge
 *     description: Cancel a draft or active challenge. All active participants will be marked as abandoned. (creator or super_admin only)
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Challenge cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     challenge:
 *                       $ref: '#/components/schemas/Challenge'
 *                     participantsAffected:
 *                       type: integer
 *                       example: 15
 *       400:
 *         description: Challenge is already cancelled or completed
 *       403:
 *         description: Not authorized to cancel this challenge
 *       404:
 *         description: Challenge not found
 */

/**
 * @swagger
 * /api/challenges/{id}/complete:
 *   post:
 *     summary: Complete a challenge
 *     description: Finalize an active challenge after end date has passed. Awards points to successful participants. (creator or super_admin only)
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Challenge completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     challenge:
 *                       $ref: '#/components/schemas/Challenge'
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalParticipants:
 *                           type: integer
 *                           example: 20
 *                         successful:
 *                           type: integer
 *                           example: 15
 *                         unsuccessful:
 *                           type: integer
 *                           example: 5
 *                         pointsAwarded:
 *                           type: integer
 *                           example: 7500
 *       400:
 *         description: Challenge cannot be completed (not active, before end date, etc.)
 *       403:
 *         description: Not authorized to complete this challenge
 *       404:
 *         description: Challenge not found
 */

/**
 * @swagger
 * /api/challenges/deleted:
 *   get:
 *     summary: Get deleted challenges
 *     description: Retrieve all soft-deleted challenges for recovery (super_admin only)
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deleted challenges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     challenges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Challenge'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires super_admin role
 */

/**
 * @swagger
 * /api/challenges/{id}/restore:
 *   post:
 *     summary: Restore a deleted challenge
 *     description: Restore a soft-deleted challenge (creator or super_admin only)
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Challenge ID
 *     responses:
 *       200:
 *         description: Challenge restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Challenge restored successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     challenge:
 *                       $ref: '#/components/schemas/Challenge'
 *       400:
 *         description: Challenge is not deleted
 *       403:
 *         description: Not authorized to restore this challenge
 *       404:
 *         description: Challenge not found
 */

// Get all challenges (with optional filters)
// GET /api/challenges?type=individual&difficulty=easy&gymId=uuid&isPublic=true
router.get('/', validateDTO(ChallengeQueryDTO, ValidationSource.QUERY), challengeController.getAllChallenges);

// Get user's participations (must be before /:id to avoid route conflicts)
// GET /api/challenges/my-participations
router.get('/my-participations', challengeController.getUserParticipations);

// Get deleted challenges (super_admin only, must be before /:id)
// GET /api/challenges/deleted
router.get(
  '/deleted',
  requireRole([UserRole.SUPER_ADMIN]),
  challengeController.getDeletedChallenges
);

// Get challenge by ID
// GET /api/challenges/:id
router.get('/:id', validateUUIDParam('id'), challengeController.getChallengeById);

// Get challenge participants
// GET /api/challenges/:id/participants
router.get('/:id/participants', validateUUIDParam('id'), challengeController.getChallengeParticipants);

// Join a challenge
// POST /api/challenges/:id/join
router.post('/:id/join', validateUUIDParam('id'), challengeController.joinChallenge);

// Leave a challenge
// POST /api/challenges/:id/leave
router.post('/:id/leave', validateUUIDParam('id'), challengeController.leaveChallenge);

/**
 * Challenge lifecycle management routes (gym_owner and super_admin)
 */

// Start a challenge (activate a draft challenge)
// POST /api/challenges/:id/start
router.post(
  '/:id/start',
  requireRole([UserRole.GYM_OWNER, UserRole.SUPER_ADMIN]),
  validateUUIDParam('id'),
  challengeController.startChallenge
);

// Cancel a challenge
// POST /api/challenges/:id/cancel
router.post(
  '/:id/cancel',
  requireRole([UserRole.GYM_OWNER, UserRole.SUPER_ADMIN]),
  validateUUIDParam('id'),
  challengeController.cancelChallenge
);

// Complete a challenge (finalize results)
// POST /api/challenges/:id/complete
router.post(
  '/:id/complete',
  requireRole([UserRole.GYM_OWNER, UserRole.SUPER_ADMIN]),
  validateUUIDParam('id'),
  challengeController.completeChallenge
);

// Restore a soft-deleted challenge
// POST /api/challenges/:id/restore
router.post(
  '/:id/restore',
  requireRole([UserRole.GYM_OWNER, UserRole.SUPER_ADMIN]),
  validateUUIDParam('id'),
  challengeController.restoreChallenge
);

/**
 * Restricted routes (gym_owner and super_admin)
 */

// Create new challenge
// POST /api/challenges
router.post(
  '/',
  requireRole([UserRole.GYM_OWNER, UserRole.SUPER_ADMIN]),
  validateDTO(CreateChallengeDTO),
  challengeController.createChallenge
);

// Update challenge (ownership checked in service)
// PATCH /api/challenges/:id
router.patch(
  '/:id',
  requireRole([UserRole.GYM_OWNER, UserRole.SUPER_ADMIN]),
  validateUUIDParam('id'),
  validateDTO(UpdateChallengeDTO),
  challengeController.updateChallenge
);

// Delete challenge (ownership checked in service)
// DELETE /api/challenges/:id
router.delete(
  '/:id',
  requireRole([UserRole.GYM_OWNER, UserRole.SUPER_ADMIN]),
  validateUUIDParam('id'),
  challengeController.deleteChallenge
);

export default router;
