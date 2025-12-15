import { Request, Response } from 'express';
import * as socialService from '../services/social.service';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

/**
 * Send a friend request
 * POST /api/friends/request
 */
export const sendFriendRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { addresseeId } = req.body;

    // Validation
    if (!addresseeId) {
      return sendError(res, 'addresseeId is required', 400);
    }

    const friendship = await socialService.sendFriendRequest(
      req.user!.userId,
      addresseeId
    );

    return sendCreated(res, 'Friend request sent successfully', friendship);
  } catch (error: any) {
    const statusCode = error.message === 'Cannot send friend request to yourself' ? 400 :
                      error.message === 'Addressee not found' ? 404 :
                      error.message === 'Users are already friends' ? 409 :
                      error.message === 'Friend request already pending' ? 409 :
                      500;
    return sendError(res, error.message, statusCode);
  }
};

/**
 * Accept a friend request
 * POST /api/friends/:id/accept
 */
export const acceptFriendRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const friendship = await socialService.acceptFriendRequest(
      id,
      req.user!.userId
    );

    return sendSuccess(res, 'Friend request accepted successfully', friendship);
  } catch (error: any) {
    const statusCode = error.message === 'Friendship not found' ? 404 :
                      error.message === 'Only the addressee can accept this friend request' ? 403 :
                      error.message === 'Friend request is not pending' ? 409 :
                      500;
    return sendError(res, error.message, statusCode);
  }
};

/**
 * Reject a friend request
 * POST /api/friends/:id/reject
 */
export const rejectFriendRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const friendship = await socialService.rejectFriendRequest(
      id,
      req.user!.userId
    );

    return sendSuccess(res, 'Friend request rejected successfully', friendship);
  } catch (error: any) {
    const statusCode = error.message === 'Friendship not found' ? 404 :
                      error.message === 'Only the addressee can reject this friend request' ? 403 :
                      error.message === 'Friend request is not pending' ? 409 :
                      500;
    return sendError(res, error.message, statusCode);
  }
};

/**
 * Remove a friend (delete friendship)
 * DELETE /api/friends/:id
 */
export const removeFriend = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    await socialService.removeFriend(id, req.user!.userId);

    return sendSuccess(res, 'Friend removed successfully', null);
  } catch (error: any) {
    const statusCode = error.message === 'Friendship not found' ? 404 :
                      error.message === 'You are not part of this friendship' ? 403 :
                      500;
    return sendError(res, error.message, statusCode);
  }
};

/**
 * List all friends (accepted friendships)
 * GET /api/friends
 */
export const listFriends = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const friends = await socialService.listFriends(req.user!.userId);

    return sendSuccess(res, 'Friends retrieved successfully', {
      count: friends.length,
      friends,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

/**
 * List pending friend requests received
 * GET /api/friends/pending
 */
export const listPendingRequests = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const requests = await socialService.listPendingRequests(req.user!.userId);

    return sendSuccess(res, 'Pending requests retrieved successfully', {
      count: requests.length,
      requests,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

/**
 * List pending friend requests sent
 * GET /api/friends/sent
 */
export const listSentRequests = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const requests = await socialService.listSentRequests(req.user!.userId);

    return sendSuccess(res, 'Sent requests retrieved successfully', {
      count: requests.length,
      requests,
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get friendship status between current user and another user
 * GET /api/friends/status/:userId
 */
export const getFriendshipStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
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
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};
