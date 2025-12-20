import { Router } from 'express';
import * as socialController from '../controllers/social.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateDTO, validateUUIDParam } from '../middleware/validate.middleware';
import { FriendRequestDTO } from '../dtos';

const router = Router();

/**
 * @swagger
 * /api/friends:
 *   get:
 *     summary: List all friends
 *     description: Retrieve all accepted friendships for the authenticated user
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Friends list retrieved successfully
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
 *                     $ref: '#/components/schemas/Friendship'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/friends/pending:
 *   get:
 *     summary: List pending friend requests
 *     description: Retrieve all pending friend requests received by the authenticated user
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending requests retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/friends/sent:
 *   get:
 *     summary: List sent friend requests
 *     description: Retrieve all friend requests sent by the authenticated user
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sent requests retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/friends/status/{userId}:
 *   get:
 *     summary: Get friendship status
 *     description: Get the friendship status between the authenticated user and another user
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The other user's ID
 *     responses:
 *       200:
 *         description: Status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [none, pending, accepted, rejected]
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/friends/request:
 *   post:
 *     summary: Send friend request
 *     description: Send a friend request to another user
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FriendRequestDTO'
 *           example:
 *             addresseeId: "550e8400-e29b-41d4-a716-446655440002"
 *     responses:
 *       201:
 *         description: Friend request sent successfully
 *       400:
 *         description: Request already exists or invalid
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/friends/{id}/accept:
 *   post:
 *     summary: Accept friend request
 *     description: Accept a pending friend request
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Friendship ID
 *     responses:
 *       200:
 *         description: Friend request accepted
 *       400:
 *         description: Cannot accept this request
 *       404:
 *         description: Request not found
 */

/**
 * @swagger
 * /api/friends/{id}/reject:
 *   post:
 *     summary: Reject friend request
 *     description: Reject a pending friend request
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Friendship ID
 *     responses:
 *       200:
 *         description: Friend request rejected
 *       400:
 *         description: Cannot reject this request
 *       404:
 *         description: Request not found
 */

/**
 * @swagger
 * /api/friends/{id}:
 *   delete:
 *     summary: Remove friend
 *     description: Remove an existing friendship (either party can remove)
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Friendship ID
 *     responses:
 *       200:
 *         description: Friend removed successfully
 *       404:
 *         description: Friendship not found
 */

// All social routes require authentication
router.use(authenticateToken);

/**
 * List all friends (accepted friendships)
 * GET /api/friends
 */
router.get('/', socialController.listFriends);

/**
 * List pending friend requests (received)
 * GET /api/friends/pending
 */
router.get('/pending', socialController.listPendingRequests);

/**
 * List sent friend requests
 * GET /api/friends/sent
 */
router.get('/sent', socialController.listSentRequests);

/**
 * Get friendship status with another user
 * GET /api/friends/status/:userId
 */
router.get('/status/:userId', validateUUIDParam('userId'), socialController.getFriendshipStatus);

/**
 * Send a friend request
 * POST /api/friends/request
 * Body: { addresseeId: string }
 */
router.post('/request', validateDTO(FriendRequestDTO), socialController.sendFriendRequest);

/**
 * Accept a friend request
 * POST /api/friends/:id/accept
 */
router.post('/:id/accept', validateUUIDParam('id'), socialController.acceptFriendRequest);

/**
 * Reject a friend request
 * POST /api/friends/:id/reject
 */
router.post('/:id/reject', validateUUIDParam('id'), socialController.rejectFriendRequest);

/**
 * Remove a friend (either party can remove)
 * DELETE /api/friends/:id
 */
router.delete('/:id', validateUUIDParam('id'), socialController.removeFriend);

export default router;
