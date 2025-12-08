import { AppDataSource } from '../config/database';
import { Challenge } from '../models/Challenge';
import { Participation } from '../models/Participation';
import { User } from '../models/User';
import { Gym } from '../models/Gym';
import { UserRole, ChallengeType, ChallengeDifficulty, ParticipationStatus, ChallengeProgress, ChallengeObjectives } from '../types';

const challengeRepository = AppDataSource.getRepository(Challenge);
const participationRepository = AppDataSource.getRepository(Participation);
const userRepository = AppDataSource.getRepository(User);
const gymRepository = AppDataSource.getRepository(Gym);

interface CreateChallengeDTO {
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  objectives: ChallengeObjectives;
  startDate: Date;
  endDate: Date;
  pointsReward: number;
  maxParticipants?: number;
  isPublic?: boolean;
  gymId?: string;
}

/**
 * Create a new challenge
 */
export const createChallenge = async (
  data: CreateChallengeDTO,
  creatorId: string
): Promise<Challenge> => {
  // Verify the creator exists
  const creator = await userRepository.findOne({ where: { id: creatorId } });
  if (!creator) {
    throw new Error('Creator not found');
  }

  // If gymId is provided, verify it exists and is approved
  if (data.gymId) {
    const gym = await gymRepository.findOne({ where: { id: data.gymId } });
    if (!gym) {
      throw new Error('Gym not found');
    }
    if (gym.status !== 'approved') {
      throw new Error('Gym must be approved to create challenges');
    }
  }

  // Validate dates
  if (data.startDate >= data.endDate) {
    throw new Error('Start date must be before end date');
  }

  if (data.startDate < new Date()) {
    throw new Error('Start date cannot be in the past');
  }

  const challenge = challengeRepository.create({
    ...data,
    creatorId,
    isPublic: data.isPublic ?? true,
  });

  return await challengeRepository.save(challenge);
};

/**
 * Get all challenges with optional filters
 */
export const listChallenges = async (filters: {
  type?: ChallengeType;
  difficulty?: ChallengeDifficulty;
  gymId?: string;
  isPublic?: boolean;
} = {}): Promise<Challenge[]> => {
  const query = challengeRepository.createQueryBuilder('challenge')
    .leftJoinAndSelect('challenge.creator', 'creator')
    .leftJoinAndSelect('challenge.gym', 'gym');

  // Apply filters
  if (filters.type) {
    query.andWhere('challenge.type = :type', { type: filters.type });
  }

  if (filters.difficulty) {
    query.andWhere('challenge.difficulty = :difficulty', { difficulty: filters.difficulty });
  }

  if (filters.gymId) {
    query.andWhere('challenge.gymId = :gymId', { gymId: filters.gymId });
  }

  if (filters.isPublic !== undefined) {
    query.andWhere('challenge.isPublic = :isPublic', { isPublic: filters.isPublic });
  }

  // Only show active challenges
  query.andWhere('challenge.status = :status', { status: 'active' });

  query.orderBy('challenge.createdAt', 'DESC');

  return await query.getMany();
};

/**
 * Get challenge by ID
 */
export const getChallengeById = async (id: string): Promise<Challenge> => {
  const challenge = await challengeRepository.findOne({
    where: { id },
    relations: ['creator', 'gym', 'recommendedExercises'],
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  return challenge;
};

/**
 * Join a challenge
 */
export const joinChallenge = async (
  challengeId: string,
  userId: string
): Promise<Participation> => {
  // Verify challenge exists
  const challenge = await challengeRepository.findOne({
    where: { id: challengeId },
  });
  if (!challenge) {
    throw new Error('Challenge not found');
  }

  // Verify user exists
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  // Check if user is already participating
  const existingParticipation = await participationRepository.findOne({
    where: { challengeId, userId },
  });
  if (existingParticipation) {
    if (existingParticipation.status === ParticipationStatus.ABANDONED) {
      // Reactivate participation
      existingParticipation.status = ParticipationStatus.JOINED;
      existingParticipation.joinedAt = new Date();
      return await participationRepository.save(existingParticipation);
    }
    throw new Error('User is already participating in this challenge');
  }

  // Check if challenge has reached max participants
  if (challenge.maxParticipants) {
    const currentParticipants = await participationRepository.count({
      where: {
        challengeId,
        status: ParticipationStatus.JOINED,
      },
    });
    if (currentParticipants >= challenge.maxParticipants) {
      throw new Error('Challenge has reached maximum participants');
    }
  }

  // Check if challenge is still open
  if (challenge.startDate > new Date()) {
    // Challenge hasn't started yet, but user can join
  } else if (challenge.endDate < new Date()) {
    throw new Error('Challenge has already ended');
  }

  // Create initial progress
  const initialProgress: ChallengeProgress = {
    currentWorkouts: 0,
    currentCalories: 0,
    currentDuration: 0,
    completionPercentage: 0,
  };

  const participation = participationRepository.create({
    challengeId,
    userId,
    status: ParticipationStatus.JOINED,
    progress: initialProgress,
  });

  return await participationRepository.save(participation);
};

/**
 * Leave a challenge
 */
export const leaveChallenge = async (
  challengeId: string,
  userId: string
): Promise<void> => {
  const participation = await participationRepository.findOne({
    where: { challengeId, userId },
  });

  if (!participation) {
    throw new Error('User is not participating in this challenge');
  }

  if (participation.status === ParticipationStatus.COMPLETED) {
    throw new Error('Cannot leave a completed challenge');
  }

  participation.status = ParticipationStatus.ABANDONED;
  await participationRepository.save(participation);
};

/**
 * Get user participations
 */
export const getUserParticipations = async (userId: string): Promise<Participation[]> => {
  return await participationRepository.find({
    where: { userId },
    relations: ['challenge', 'challenge.gym'],
    order: { joinedAt: 'DESC' },
  });
};

/**
 * Get challenge participants
 */
export const getChallengeParticipants = async (challengeId: string): Promise<Participation[]> => {
  return await participationRepository.find({
    where: { challengeId },
    relations: ['user'],
    order: { joinedAt: 'ASC' },
  });
};
