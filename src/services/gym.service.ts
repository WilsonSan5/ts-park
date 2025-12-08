import { AppDataSource } from '../config/database';
import { Gym } from '../models/Gym';
import { User } from '../models/User';
import { UserRole, GymStatus } from '../types';

const gymRepository = AppDataSource.getRepository(Gym);
const userRepository = AppDataSource.getRepository(User);

interface CreateGymDTO {
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  capacity: number;
  equipment: string[];
  specializedExerciseTypes?: string[];
}

interface UpdateGymDTO {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  equipment?: string[];
  specializedExerciseTypes?: string[];
}

/**
 * Create a new gym (Gym Owner only)
 */
export const createGym = async (
  data: CreateGymDTO,
  ownerId: string
): Promise<Gym> => {
  // Verify the creator is a gym owner
  const owner = await userRepository.findOne({ where: { id: ownerId } });
  if (!owner || owner.role !== UserRole.GYM_OWNER) {
    throw new Error('Only gym owners can create gyms');
  }

  const gym = gymRepository.create({
    ...data,
    ownerId,
    status: GymStatus.PENDING,
  });

  return await gymRepository.save(gym);
};

/**
 * Get all approved gyms
 */
export const listApprovedGyms = async (): Promise<Gym[]> => {
  return await gymRepository.find({
    where: { status: GymStatus.APPROVED },
    relations: ['owner'],
    order: { name: 'ASC' },
  });
};

/**
 * Get gym by ID
 */
export const getGymById = async (id: string): Promise<Gym> => {
  const gym = await gymRepository.findOne({
    where: { id },
    relations: ['owner'],
  });

  if (!gym) {
    throw new Error('Gym not found');
  }

  return gym;
};

/**
 * Update a gym (Owner or Super Admin only)
 */
export const updateGym = async (
  id: string,
  data: UpdateGymDTO,
  userId: string
): Promise<Gym> => {
  const gym = await gymRepository.findOne({ where: { id } });
  if (!gym) {
    throw new Error('Gym not found');
  }

  // Verify the user is the owner or a super admin
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  if (gym.ownerId !== userId && user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Only the gym owner or super administrators can update this gym');
  }

  // Update fields
  Object.assign(gym, data);

  return await gymRepository.save(gym);
};

/**
 * Approve a gym (Super Admin only)
 */
export const approveGym = async (
  id: string,
  userId: string
): Promise<Gym> => {
  // Verify the user is a super admin
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Only super administrators can approve gyms');
  }

  const gym = await gymRepository.findOne({ where: { id } });
  if (!gym) {
    throw new Error('Gym not found');
  }

  gym.status = GymStatus.APPROVED;

  return await gymRepository.save(gym);
};

/**
 * Get gyms by owner ID
 */
export const getGymsByOwner = async (ownerId: string): Promise<Gym[]> => {
  return await gymRepository.find({
    where: { ownerId },
    order: { createdAt: 'DESC' },
  });
};

/**
 * Get all gyms (Super Admin only)
 */
export const getAllGyms = async (userId: string): Promise<Gym[]> => {
  // Verify the user is a super admin
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Only super administrators can view all gyms');
  }

  return await gymRepository.find({
    relations: ['owner'],
    order: { createdAt: 'DESC' },
  });
};
