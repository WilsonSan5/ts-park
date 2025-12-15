import { Router } from 'express';
import * as socialController from '../controllers/social.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * <“ SOCIAL/FRIENDSHIP ROUTES
 *
 * All routes require authentication.
 * Handles friend requests, acceptances, rejections, and friend listing.
 *
 * Endpoints:
 * - GET    /api/friends                 ’ List all friends
 * - GET    /api/friends/pending         ’ List pending requests (received)
 * - GET    /api/friends/sent            ’ List sent requests
 * - GET    /api/friends/status/:userId  ’ Get friendship status with user
 * - POST   /api/friends/request         ’ Send a friend request
 * - POST   /api/friends/:id/accept      ’ Accept a friend request
 * - POST   /api/friends/:id/reject      ’ Reject a friend request
 * - DELETE /api/friends/:id             ’ Remove a friend
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
router.get('/status/:userId', socialController.getFriendshipStatus);

/**
 * Send a friend request
 * POST /api/friends/request
 * Body: { addresseeId: string }
 */
router.post('/request', socialController.sendFriendRequest);

/**
 * Accept a friend request
 * POST /api/friends/:id/accept
 */
router.post('/:id/accept', socialController.acceptFriendRequest);

/**
 * Reject a friend request
 * POST /api/friends/:id/reject
 */
router.post('/:id/reject', socialController.rejectFriendRequest);

/**
 * Remove a friend (either party can remove)
 * DELETE /api/friends/:id
 */
router.delete('/:id', socialController.removeFriend);

export default router;
