import { AppDataSource } from '../config/database';
import { Challenge } from '../models/Challenge';
import { Participation } from '../models/Participation';
import { User } from '../models/User';
import { Exercise } from '../models/Exercise';
import { Gym } from '../models/Gym';
import {
  CreateChallengeDTO,
  UpdateChallengeDTO,
  FilterChallengesDTO,
  UserRole,
  ParticipationStatus,
  ChallengeStatus,
  ChallengeObjectives,
  ChallengeProgress
} from '../types';
import { In } from 'typeorm';

const challengeRepository = AppDataSource.getRepository(Challenge);
const participationRepository = AppDataSource.getRepository(Participation);
const userRepository = AppDataSource.getRepository(User);
const exerciseRepository = AppDataSource.getRepository(Exercise);
const gymRepository = AppDataSource.getRepository(Gym);

/**
 * Create a new challenge (gym_owner or super_admin only)
 */
export const createChallenge = async (
  data: CreateChallengeDTO,
  creatorId: string
): Promise<Challenge> => {
  // Verify the creator is gym_owner or super_admin
  const creator = await userRepository.findOne({ where: { id: creatorId } });
  if (!creator || (creator.role !== UserRole.GYM_OWNER && creator.role !== UserRole.SUPER_ADMIN)) {
    throw new Error('Only gym owners and super administrators can create challenges');
  }

  // Validate dates
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (endDate <= startDate) {
    throw new Error('End date must be after start date');
  }

  // Compare dates only (ignore time) - allow today as valid start date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDateOnly = new Date(startDate);
  startDateOnly.setHours(0, 0, 0, 0);

  if (startDateOnly < today) {
    throw new Error('Start date cannot be in the past');
  }

  // Validate gym ownership if gymId provided
  if (data.gymId) {
    const gym = await gymRepository.findOne({
      where: { id: data.gymId },
      relations: ['owner']
    });

    if (!gym) {
      throw new Error('Gym not found');
    }

    // Only gym owner or super admin can create challenges for a gym
    if (creator.role !== UserRole.SUPER_ADMIN && gym.owner.id !== creatorId) {
      throw new Error('You can only create challenges for your own gym');
    }
  }

  // Handle recommended exercises if provided
  let recommendedExercises: Exercise[] = [];
  if (data.recommendedExerciseIds && data.recommendedExerciseIds.length > 0) {
    // Filter out empty strings and invalid entries
    const validExerciseIds = data.recommendedExerciseIds.filter(id => id && id.trim() !== '');

    if (validExerciseIds.length > 0) {
      recommendedExercises = await exerciseRepository.find({
        where: { id: In(validExerciseIds) }
      });

      // SECURITY: Generic message to prevent ID enumeration
      if (recommendedExercises.length !== validExerciseIds.length) {
        throw new Error('Invalid exercise data provided');
      }
    }
  }

  const challenge = challengeRepository.create({
    title: data.title,
    description: data.description,
    type: data.type,
    difficulty: data.difficulty,
    objectives: data.objectives,
    startDate,
    endDate,
    maxParticipants: data.maxParticipants,
    pointsReward: data.pointsReward,
    isPublic: data.isPublic,
    creatorId,
    gymId: data.gymId,
    recommendedExercises,
  });

  return await challengeRepository.save(challenge);
};

/**
 * Get all challenges with optional filters
 */
export const getAllChallenges = async (
  filters: FilterChallengesDTO = {}
): Promise<Challenge[]> => {
  const query = challengeRepository.createQueryBuilder('challenge')
    .leftJoinAndSelect('challenge.creator', 'creator')
    .leftJoinAndSelect('challenge.gym', 'gym')
    .leftJoinAndSelect('challenge.recommendedExercises', 'exercises')
    .where('challenge.deletedAt IS NULL'); // Exclude soft-deleted challenges

  // Apply type filter
  if (filters.type) {
    query.andWhere('challenge.type = :type', { type: filters.type });
  }

  // Apply difficulty filter
  if (filters.difficulty) {
    query.andWhere('challenge.difficulty = :difficulty', { difficulty: filters.difficulty });
  }

  // Apply gym filter
  if (filters.gymId) {
    query.andWhere('challenge.gymId = :gymId', { gymId: filters.gymId });
  }

  // Apply public filter
  if (filters.isPublic !== undefined) {
    query.andWhere('challenge.isPublic = :isPublic', { isPublic: filters.isPublic });
  }

  query.orderBy('challenge.createdAt', 'DESC');

  return await query.getMany();
};

/**
 * Get challenge by ID with relations
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
 * Update a challenge (creator or super_admin only)
 */
export const updateChallenge = async (
  id: string,
  data: UpdateChallengeDTO,
  userId: string
): Promise<Challenge> => {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const challenge = await challengeRepository.findOne({
    where: { id },
    relations: ['creator', 'recommendedExercises']
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  // Verify ownership or super admin
  if (user.role !== UserRole.SUPER_ADMIN && challenge.creatorId !== userId) {
    throw new Error('You can only update your own challenges');
  }

  // Validate dates if provided
  if (data.startDate || data.endDate) {
    const startDate = data.startDate ? new Date(data.startDate) : challenge.startDate;
    const endDate = data.endDate ? new Date(data.endDate) : challenge.endDate;

    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }
  }

  // Handle recommended exercises update
  if (data.recommendedExerciseIds) {
    // Filter out empty strings and invalid entries
    const validExerciseIds = data.recommendedExerciseIds.filter(id => id && id.trim() !== '');

    if (validExerciseIds.length > 0) {
      const recommendedExercises = await exerciseRepository.find({
        where: { id: In(validExerciseIds) }
      });

      // SECURITY: Generic message to prevent ID enumeration
      if (recommendedExercises.length !== validExerciseIds.length) {
        throw new Error('Invalid exercise data provided');
      }

      challenge.recommendedExercises = recommendedExercises;
    } else {
      // Empty array means clear all recommended exercises
      challenge.recommendedExercises = [];
    }
  }

  // Security: Whitelist allowed fields to prevent mass assignment vulnerability
  const allowedFields = [
    'title',
    'description',
    'type',
    'difficulty',
    'objectives',
    'pointsReward',
    'isPublic',
    'status'
  ] as const;

  // Only update whitelisted fields - type-safe assignment
  type AllowedField = typeof allowedFields[number];
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      (challenge[field] as Challenge[AllowedField]) = data[field] as Challenge[AllowedField];
    }
  }

  // Handle dates separately with proper conversion
  if (data.startDate) {
    challenge.startDate = new Date(data.startDate);
  }
  if (data.endDate) {
    challenge.endDate = new Date(data.endDate);
  }

  return await challengeRepository.save(challenge);
};

/**
 * Delete a challenge (creator or super_admin only)
 */
export const deleteChallenge = async (
  id: string,
  userId: string
): Promise<void> => {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const challenge = await challengeRepository.findOne({
    where: { id },
    relations: ['creator']
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  // Verify ownership or super admin
  if (user.role !== UserRole.SUPER_ADMIN && challenge.creatorId !== userId) {
    throw new Error('You can only delete your own challenges');
  }

  // Use soft delete to preserve participation history
  await challengeRepository.softRemove(challenge);
};

/**
 * Join a challenge
 */
export const joinChallenge = async (
  challengeId: string,
  userId: string
): Promise<Participation> => {
  const challenge = await challengeRepository.findOne({
    where: { id: challengeId }
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  // Check if challenge is active
  if (challenge.status !== ChallengeStatus.ACTIVE) {
    throw new Error('Challenge is not active');
  }

  // Check if challenge has started
  if (new Date() < challenge.startDate) {
    throw new Error('Challenge has not started yet');
  }

  // Check if challenge has ended
  if (new Date() > challenge.endDate) {
    throw new Error('Challenge has already ended');
  }

  // Check if user already joined
  const existingParticipation = await participationRepository.findOne({
    where: {
      userId,
      challengeId,
      status: In([ParticipationStatus.JOINED, ParticipationStatus.IN_PROGRESS])
    }
  });

  if (existingParticipation) {
    throw new Error('You have already joined this challenge');
  }

  // Check max participants
  if (challenge.maxParticipants) {
    const currentParticipants = await participationRepository.count({
      where: {
        challengeId,
        status: In([ParticipationStatus.JOINED, ParticipationStatus.IN_PROGRESS])
      }
    });

    if (currentParticipants >= challenge.maxParticipants) {
      throw new Error('Challenge has reached maximum participants');
    }
  }

  // Create participation
  const participation = participationRepository.create({
    userId,
    challengeId,
    status: ParticipationStatus.JOINED,
    progress: {
      currentWorkouts: 0,
      currentCalories: 0,
      currentDuration: 0,
      completionPercentage: 0,
    },
    pointsEarned: 0,
  });

  return await participationRepository.save(participation);
};

/**
 * Leave a challenge
 */
export const leaveChallenge = async (
  challengeId: string,
  userId: string
): Promise<Participation> => {
  const participation = await participationRepository.findOne({
    where: {
      userId,
      challengeId,
      status: In([ParticipationStatus.JOINED, ParticipationStatus.IN_PROGRESS])
    }
  });

  if (!participation) {
    throw new Error('You are not participating in this challenge');
  }

  // Update status to abandoned
  participation.status = ParticipationStatus.ABANDONED;

  return await participationRepository.save(participation);
};

/**
 * Get challenge participants
 */
export const getChallengeParticipants = async (
  challengeId: string
): Promise<Participation[]> => {
  const challenge = await challengeRepository.findOne({
    where: { id: challengeId }
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  return await participationRepository.find({
    where: { challengeId },
    relations: ['user'],
    order: { joinedAt: 'DESC' }
  });
};

/**
 * Get user's participations
 */
export const getUserParticipations = async (
  userId: string
): Promise<Participation[]> => {
  return await participationRepository.find({
    where: { userId },
    relations: ['challenge', 'challenge.gym'],
    order: { joinedAt: 'DESC' }
  });
};

/**
 * Start a challenge (transition from DRAFT to ACTIVE)
 */
export const startChallenge = async (
  challengeId: string,
  userId: string
): Promise<Challenge> => {
  const challenge = await challengeRepository.findOne({
    where: { id: challengeId },
    relations: ['creator']
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  // Authorization: Must be creator OR super_admin
  if (user.role !== UserRole.SUPER_ADMIN && challenge.creatorId !== userId) {
    throw new Error('Only the challenge creator or super administrators can activate this challenge');
  }

  // State validation: Must be in DRAFT status
  if (challenge.status === ChallengeStatus.ACTIVE) {
    throw new Error('Challenge is already active');
  }

  if (challenge.status !== ChallengeStatus.DRAFT) {
    throw new Error('Only draft challenges can be activated');
  }

  // Date validation: Start date must not be in the past
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const challengeStartDate = new Date(challenge.startDate);
  const startOfChallengeDate = new Date(
    challengeStartDate.getFullYear(),
    challengeStartDate.getMonth(),
    challengeStartDate.getDate()
  );

  if (startOfChallengeDate < startOfToday) {
    throw new Error('Cannot activate challenge with past start date. Please update the start date first.');
  }

  // Transition to ACTIVE state
  challenge.status = ChallengeStatus.ACTIVE;

  return await challengeRepository.save(challenge);
};

/**
 * Cancel a challenge (transition to CANCELLED)
 * All active participations are marked as abandoned
 */
export const cancelChallenge = async (
  challengeId: string,
  userId: string
): Promise<{ challenge: Challenge; participantsAffected: number }> => {
  const challenge = await challengeRepository.findOne({
    where: { id: challengeId },
    relations: ['creator']
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  // Authorization: Must be creator OR super_admin
  if (user.role !== UserRole.SUPER_ADMIN && challenge.creatorId !== userId) {
    throw new Error('Only the challenge creator or super administrators can cancel this challenge');
  }

  // State validation
  if (challenge.status === ChallengeStatus.CANCELLED) {
    throw new Error('Challenge is already cancelled');
  }

  if (challenge.status === ChallengeStatus.COMPLETED) {
    throw new Error('Cannot cancel a completed challenge');
  }

  let participantsAffected = 0;

  // Use transaction for atomic operations
  await AppDataSource.transaction(async (manager) => {
    // Count and update all active participations to abandoned
    const updateResult = await manager
      .createQueryBuilder()
      .update(Participation)
      .set({
        status: ParticipationStatus.ABANDONED,
        pointsEarned: 0
      })
      .where('challengeId = :challengeId', { challengeId })
      .andWhere('status IN (:...statuses)', {
        statuses: [ParticipationStatus.JOINED, ParticipationStatus.IN_PROGRESS]
      })
      .execute();

    participantsAffected = updateResult.affected || 0;

    // Update challenge status to cancelled
    challenge.status = ChallengeStatus.CANCELLED;
    await manager.save(Challenge, challenge);
  });

  return { challenge, participantsAffected };
};

/**
 * Complete a challenge (finalize results and award points)
 * Can only be called after endDate has passed
 */
export const completeChallenge = async (
  challengeId: string,
  userId: string
): Promise<{ challenge: Challenge; statistics: { totalParticipants: number; successful: number; unsuccessful: number; pointsAwarded: number } }> => {
  const challenge = await challengeRepository.findOne({
    where: { id: challengeId },
    relations: ['creator']
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  // Authorization: Must be creator OR super_admin
  if (user.role !== UserRole.SUPER_ADMIN && challenge.creatorId !== userId) {
    throw new Error('Only the challenge creator or super administrators can complete this challenge');
  }

  // State validation
  if (challenge.status === ChallengeStatus.COMPLETED) {
    throw new Error('Challenge is already completed');
  }

  if (challenge.status === ChallengeStatus.CANCELLED) {
    throw new Error('Cannot complete a cancelled challenge');
  }

  if (challenge.status !== ChallengeStatus.ACTIVE) {
    throw new Error('Only active challenges can be completed');
  }

  // Date validation: Must have reached end date
  const now = new Date();
  if (now < challenge.endDate) {
    throw new Error('Cannot complete challenge before end date has passed');
  }

  const statistics = {
    totalParticipants: 0,
    successful: 0,
    unsuccessful: 0,
    pointsAwarded: 0
  };

  // Use transaction for atomic completion
  await AppDataSource.transaction(async (manager) => {
    // Fetch all active participations
    const participations = await manager.find(Participation, {
      where: {
        challengeId,
        status: In([ParticipationStatus.JOINED, ParticipationStatus.IN_PROGRESS])
      }
    });

    statistics.totalParticipants = participations.length;

    // Evaluate each participation against challenge objectives
    for (const participation of participations) {
      const metObjectives = checkObjectivesCompletion(
        challenge.objectives,
        participation.progress
      );

      if (metObjectives) {
        // Success: Mark as completed and award points
        participation.status = ParticipationStatus.COMPLETED;
        participation.pointsEarned = challenge.pointsReward;
        participation.completedAt = now;

        // Update user's total points
        await manager.increment(User, { id: participation.userId }, 'points', challenge.pointsReward);

        statistics.successful++;
        statistics.pointsAwarded += challenge.pointsReward;
      } else {
        // Did not meet objectives: Mark as abandoned
        participation.status = ParticipationStatus.ABANDONED;
        participation.pointsEarned = 0;
        statistics.unsuccessful++;
      }

      await manager.save(Participation, participation);
    }

    // Update challenge status to completed
    challenge.status = ChallengeStatus.COMPLETED;
    await manager.save(Challenge, challenge);
  });

  return { challenge, statistics };
};

/**
 * Helper function to check if participant met challenge objectives
 */
function checkObjectivesCompletion(
  objectives: ChallengeObjectives,
  progress: ChallengeProgress
): boolean {
  // All defined objectives must be met (AND logic)
  if (objectives.targetWorkouts && progress.currentWorkouts < objectives.targetWorkouts) {
    return false;
  }

  if (objectives.targetCalories && progress.currentCalories < objectives.targetCalories) {
    return false;
  }

  if (objectives.targetDuration && progress.currentDuration < objectives.targetDuration) {
    return false;
  }

  return true;
}

/**
 * Get all deleted challenges (super_admin only)
 */
export const getDeletedChallenges = async (
  userId: string
): Promise<Challenge[]> => {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  if (user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Only super administrators can view deleted challenges');
  }

  // Use QueryBuilder with withDeleted to include soft-deleted records
  const challenges = await challengeRepository
    .createQueryBuilder('challenge')
    .withDeleted()
    .leftJoinAndSelect('challenge.creator', 'creator')
    .leftJoinAndSelect('challenge.gym', 'gym')
    .where('challenge.deletedAt IS NOT NULL')
    .orderBy('challenge.deletedAt', 'DESC')
    .getMany();

  return challenges;
};

/**
 * Restore a soft-deleted challenge (creator or super_admin only)
 */
export const restoreChallenge = async (
  id: string,
  userId: string
): Promise<Challenge> => {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  // Find including soft-deleted records
  const challenge = await challengeRepository
    .createQueryBuilder('challenge')
    .withDeleted()
    .leftJoinAndSelect('challenge.creator', 'creator')
    .leftJoinAndSelect('challenge.gym', 'gym')
    .where('challenge.id = :id', { id })
    .getOne();

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  if (!challenge.deletedAt) {
    throw new Error('Challenge is not deleted');
  }

  // Verify ownership or super admin
  if (user.role !== UserRole.SUPER_ADMIN && challenge.creatorId !== userId) {
    throw new Error('You can only restore your own challenges');
  }

  // Restore the challenge
  await challengeRepository.recover(challenge);

  // Reload to get fresh data without deletedAt
  const restored = await challengeRepository.findOne({
    where: { id },
    relations: ['creator', 'gym', 'recommendedExercises']
  });

  return restored!;
};
