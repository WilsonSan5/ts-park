import { AppDataSource } from '../config/database';
import { Friendship } from '../models/Friendship';
import { User } from '../models/User';
import { FriendshipStatus, NotificationType } from '../types';
import * as notificationService from './notification.service';

const friendshipRepository = AppDataSource.getRepository(Friendship);
const userRepository = AppDataSource.getRepository(User);

/**
 * Send a friend request
 */
export const sendFriendRequest = async (
  requesterId: string,
  addresseeId: string
): Promise<Friendship> => {
  // Validate not self-request
  if (requesterId === addresseeId) {
    throw new Error('Cannot send friend request to yourself');
  }

  // Verify both users exist
  const requester = await userRepository.findOne({ where: { id: requesterId } });
  if (!requester) {
    throw new Error('Requester not found');
  }

  const addressee = await userRepository.findOne({ where: { id: addresseeId } });
  if (!addressee) {
    throw new Error('Addressee not found');
  }

  // Check for existing friendship (in either direction)
  const existingFriendship = await friendshipRepository
    .createQueryBuilder('friendship')
    .where(
      '(friendship.requesterId = :requesterId AND friendship.addresseeId = :addresseeId)',
      { requesterId, addresseeId }
    )
    .orWhere(
      '(friendship.requesterId = :addresseeId AND friendship.addresseeId = :requesterId)',
      { requesterId, addresseeId }
    )
    .getOne();

  if (existingFriendship) {
    if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
      throw new Error('Users are already friends');
    }
    if (existingFriendship.status === FriendshipStatus.PENDING) {
      throw new Error('Friend request already pending');
    }
    // If rejected, allow re-sending by updating the existing record
    if (existingFriendship.status === FriendshipStatus.REJECTED) {
      existingFriendship.status = FriendshipStatus.PENDING;
      existingFriendship.requesterId = requesterId;
      existingFriendship.addresseeId = addresseeId;
      existingFriendship.respondedAt = undefined;
      return await friendshipRepository.save(existingFriendship);
    }
  }

  // Create new friendship with PENDING status
  const friendship = friendshipRepository.create({
    requesterId,
    addresseeId,
    status: FriendshipStatus.PENDING,
  });

  const savedFriendship = await friendshipRepository.save(friendship);

  // Send notification to recipient
  await notificationService.createNotification(
    addresseeId,
    NotificationType.FRIEND_REQUEST,
    'New Friend Request',
    `${requester.firstName} ${requester.lastName} sent you a friend request`
  );

  return savedFriendship;
};

/**
 * Accept a friend request
 */
export const acceptFriendRequest = async (
  friendshipId: string,
  userId: string
): Promise<Friendship> => {
  // Verify friendship exists
  const friendship = await friendshipRepository.findOne({
    where: { id: friendshipId },
    relations: ['requester', 'addressee'],
  });

  if (!friendship) {
    throw new Error('Friendship not found');
  }

  // Verify user is the addressee
  if (friendship.addresseeId !== userId) {
    throw new Error('Only the addressee can accept this friend request');
  }

  // Verify status is PENDING
  if (friendship.status !== FriendshipStatus.PENDING) {
    throw new Error('Friend request is not pending');
  }

  // Update to ACCEPTED, set respondedAt
  friendship.status = FriendshipStatus.ACCEPTED;
  friendship.respondedAt = new Date();

  const savedFriendship = await friendshipRepository.save(friendship);

  // Send notification to requester
  await notificationService.createNotification(
    friendship.requesterId,
    NotificationType.FRIEND_REQUEST,
    'Friend Request Accepted',
    `${friendship.addressee.firstName} ${friendship.addressee.lastName} accepted your friend request`
  );

  return savedFriendship;
};

/**
 * Reject a friend request
 */
export const rejectFriendRequest = async (
  friendshipId: string,
  userId: string
): Promise<Friendship> => {
  // Verify friendship exists
  const friendship = await friendshipRepository.findOne({
    where: { id: friendshipId },
    relations: ['requester', 'addressee'],
  });

  if (!friendship) {
    throw new Error('Friendship not found');
  }

  // Verify user is the addressee
  if (friendship.addresseeId !== userId) {
    throw new Error('Only the addressee can reject this friend request');
  }

  // Verify status is PENDING
  if (friendship.status !== FriendshipStatus.PENDING) {
    throw new Error('Friend request is not pending');
  }

  // Update to REJECTED, set respondedAt
  friendship.status = FriendshipStatus.REJECTED;
  friendship.respondedAt = new Date();

  return await friendshipRepository.save(friendship);
};

/**
 * Remove a friend (delete friendship)
 */
export const removeFriend = async (
  friendshipId: string,
  userId: string
): Promise<void> => {
  // Verify friendship exists
  const friendship = await friendshipRepository.findOne({
    where: { id: friendshipId },
  });

  if (!friendship) {
    throw new Error('Friendship not found');
  }

  // Verify user is requester OR addressee
  if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
    throw new Error('You are not part of this friendship');
  }

  // Delete the friendship record
  await friendshipRepository.remove(friendship);
};

/**
 * List all friends (accepted friendships)
 */
export const listFriends = async (userId: string): Promise<User[]> => {
  // Find all ACCEPTED friendships where user is requester OR addressee
  const friendships = await friendshipRepository
    .createQueryBuilder('friendship')
    .leftJoinAndSelect('friendship.requester', 'requester')
    .leftJoinAndSelect('friendship.addressee', 'addressee')
    .where('friendship.status = :status', { status: FriendshipStatus.ACCEPTED })
    .andWhere(
      '(friendship.requesterId = :userId OR friendship.addresseeId = :userId)',
      { userId }
    )
    .getMany();

  // Return the "other" user in each friendship
  return friendships.map((friendship) => {
    return friendship.requesterId === userId
      ? friendship.addressee
      : friendship.requester;
  });
};

/**
 * List pending friend requests received
 */
export const listPendingRequests = async (userId: string): Promise<Friendship[]> => {
  // Find PENDING friendships where user is addressee
  return await friendshipRepository.find({
    where: {
      addresseeId: userId,
      status: FriendshipStatus.PENDING,
    },
    relations: ['requester'],
    order: { createdAt: 'DESC' },
  });
};

/**
 * List pending friend requests sent
 */
export const listSentRequests = async (userId: string): Promise<Friendship[]> => {
  // Find PENDING friendships where user is requester
  return await friendshipRepository.find({
    where: {
      requesterId: userId,
      status: FriendshipStatus.PENDING,
    },
    relations: ['addressee'],
    order: { createdAt: 'DESC' },
  });
};

/**
 * Get friendship status between two users
 */
export const getFriendshipStatus = async (
  userId: string,
  otherUserId: string
): Promise<Friendship | null> => {
  // Check if friendship exists between two users (in either direction)
  const friendship = await friendshipRepository
    .createQueryBuilder('friendship')
    .where(
      '(friendship.requesterId = :userId AND friendship.addresseeId = :otherUserId)',
      { userId, otherUserId }
    )
    .orWhere(
      '(friendship.requesterId = :otherUserId AND friendship.addresseeId = :userId)',
      { userId, otherUserId }
    )
    .getOne();

  return friendship;
};
