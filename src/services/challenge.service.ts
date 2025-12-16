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
  ChallengeStatus
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

  if (startDate < new Date()) {
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

      if (recommendedExercises.length !== validExerciseIds.length) {
        throw new Error('One or more exercise IDs are invalid');
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
    .leftJoinAndSelect('challenge.recommendedExercises', 'exercises');

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

      if (recommendedExercises.length !== validExerciseIds.length) {
        throw new Error('One or more exercise IDs are invalid');
      }

      challenge.recommendedExercises = recommendedExercises;
    } else {
      // Empty array means clear all recommended exercises
      challenge.recommendedExercises = [];
    }
  }

  // Update fields
  Object.assign(challenge, {
    ...data,
    startDate: data.startDate ? new Date(data.startDate) : challenge.startDate,
    endDate: data.endDate ? new Date(data.endDate) : challenge.endDate,
  });

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

  await challengeRepository.remove(challenge);
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
