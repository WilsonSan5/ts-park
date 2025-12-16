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

export interface WorkoutExercise {
  exerciseIds: string;
  repetitions: number;
  sets: number;
  restPeriods: number | null;
  weight: number | null;
}

export interface Workout {
  name: string;
  description: string;
  duration: number;
  caloriesBurned: number;
  exercises: Array<WorkoutExercise>;
  createdAt: Date;
  userId: string;
}

export interface Badge {
  name: string;
  description: string;
  icon: string;
  pointsValue: number;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface BadgeAssignment {
  badgeId: string;
  userId: string;
  givenAt: Date;
}

// ==================== DTOS ====================

export interface CreateChallengeDTO {
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  objectives: ChallengeObjectives;
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  pointsReward: number;
  isPublic: boolean;
  gymId?: string;
  recommendedExerciseIds?: string[];
}

export interface UpdateChallengeDTO {
  title?: string;
  description?: string;
  type?: ChallengeType;
  difficulty?: ChallengeDifficulty;
  objectives?: ChallengeObjectives;
  startDate?: Date;
  endDate?: Date;
  maxParticipants?: number;
  pointsReward?: number;
  isPublic?: boolean;
  status?: ChallengeStatus;
  recommendedExerciseIds?: string[];
}

export interface FilterChallengesDTO {
  type?: ChallengeType;
  difficulty?: ChallengeDifficulty;
  gymId?: string;
  isPublic?: boolean;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
