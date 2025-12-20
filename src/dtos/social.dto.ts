import { IsUUID } from 'class-validator';

/**
 * DTO for sending a friend request
 */
export class FriendRequestDTO {
  @IsUUID('4', { message: 'Addressee ID must be a valid UUID' })
  addresseeId: string;
}

/**
 * DTO for accepting or rejecting a friend request
 * Used for actions on friendship by ID (via URL params)
 */
export class FriendActionDTO {
  @IsUUID('4', { message: 'Friendship ID must be a valid UUID' })
  id: string;
}

/**
 * DTO for checking friendship status
 */
export class FriendshipStatusDTO {
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;
}
