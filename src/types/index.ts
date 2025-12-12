// ==================== ENUMS ====================

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  GYM_OWNER = 'gym_owner',
  CLIENT = 'client',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum GymStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ChallengeType {
  INDIVIDUAL = 'individual',
  TEAM = 'team',
  SOCIAL = 'social',
}

export enum ChallengeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXTREME = 'extreme',
}

export enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ParticipationStatus {
  JOINED = 'joined',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum NotificationType {
  FRIEND_REQUEST = 'friend_request',
  CHALLENGE_INVITE = 'challenge_invite',
  BADGE_AWARDED = 'badge_awarded',
  CHALLENGE_COMPLETED = 'challenge_completed',
  GYM_APPROVED = 'gym_approved',
  GYM_REJECTED = 'gym_rejected',
}

// ==================== INTERFACES ====================

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface ChallengeObjectives {
  targetDuration?: number; // minutes
  targetCalories?: number;
  targetWorkouts?: number;
}

export interface ChallengeProgress {
  currentWorkouts: number;
  currentCalories: number;
  currentDuration: number;
  completionPercentage: number;
}

export interface Workout {
  name: string;
  description: string;
  difficulty: string;
  duration: number;
  caloriesBurned: number;
  exercises: Array<number>;
  createdAt: Date;
  userId: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
