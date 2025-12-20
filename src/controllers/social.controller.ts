import { Request, Response } from 'express';
import * as socialService from '../services/social.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';

/**
 * Send a friend request
 * POST /api/friends/request
 */
export const sendFriendRequest = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { addresseeId } = req.body;

  const friendship = await socialService.sendFriendRequest(
    req.user!.userId,
    addresseeId
  );

  return sendCreated(res, 'Friend request sent successfully', friendship);
});

/**
 * Accept a friend request
 * POST /api/friends/:id/accept
 */
export const acceptFriendRequest = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const friendship = await socialService.acceptFriendRequest(
    id,
    req.user!.userId
  );

  return sendSuccess(res, 'Friend request accepted successfully', friendship);
});

/**
 * Reject a friend request
 * POST /api/friends/:id/reject
 */
export const rejectFriendRequest = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const friendship = await socialService.rejectFriendRequest(
    id,
    req.user!.userId
  );

  return sendSuccess(res, 'Friend request rejected successfully', friendship);
});

/**
 * Remove a friend (delete friendship)
 * DELETE /api/friends/:id
 */
export const removeFriend = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  await socialService.removeFriend(id, req.user!.userId);

  return sendSuccess(res, 'Friend removed successfully', null);
});

/**
 * List all friends (accepted friendships)
 * GET /api/friends
 */
export const listFriends = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const friends = await socialService.listFriends(req.user!.userId);

  return sendSuccess(res, 'Friends retrieved successfully', {
    count: friends.length,
    friends,
  });
});

/**
 * List pending friend requests received
 * GET /api/friends/pending
 */
export const listPendingRequests = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const requests = await socialService.listPendingRequests(req.user!.userId);

  return sendSuccess(res, 'Pending requests retrieved successfully', {
    count: requests.length,
    requests,
  });
});

/**
 * List pending friend requests sent
 * GET /api/friends/sent
 */
export const listSentRequests = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const requests = await socialService.listSentRequests(req.user!.userId);

  return sendSuccess(res, 'Sent requests retrieved successfully', {
    count: requests.length,
    requests,
  });
});

/**
 * Get friendship status between current user and another user
 * GET /api/friends/status/:userId
 */
export const getFriendshipStatus = asyncHandler(async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;

  const friendship = await socialService.getFriendshipStatus(
    req.user!.userId,
    userId
  );

  const isFriend = friendship?.status === 'accepted';
  const status = friendship?.status || 'none';

  return sendSuccess(res, 'Friendship status retrieved successfully', {
    isFriend,
    status,
    friendship,
  });
});
