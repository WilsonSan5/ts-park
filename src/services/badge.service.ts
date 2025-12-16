import { AppDataSource } from '@config/database';
import { Badge as BadgeModel } from '../models/Badge';
import { UserBadge } from 'models/UserBadge';
import { BadgeAssignment, Badge } from '../types';

export class BadgeService {
    public async createBadge(badgeData: Badge) {
        const badgeRepository = AppDataSource.getRepository(BadgeModel);
        const badge = badgeRepository.create(badgeData);
        const responses = await badgeRepository.save(badge);
        return responses; // Return the created workout data
    }

    public async assignBadge(badgeAssignmentData: BadgeAssignment) {
        // Chekc if badge and user exist
        const badgeRepository = AppDataSource.getRepository(BadgeModel);
        const badge = await badgeRepository.findOne({ where: { id: badgeAssignmentData.badgeId } });
        if (!badge) {
            throw new Error('Badge not found');
        }
        const userRepository = AppDataSource.getRepository('users');
        const user = await userRepository.findOne({ where: { id: badgeAssignmentData.userId } });
        if (!user) {
            throw new Error('User not found');
        }

        // Check if user already has the badge
        const UserBadgeRepository = AppDataSource.getRepository(UserBadge);
        const existingAssignment = await UserBadgeRepository.findOne({
            where: {
                badgeId: badgeAssignmentData.badgeId,
                userId: badgeAssignmentData.userId
            }
        });
        if (existingAssignment) {
            throw new Error('User already has this badge assigned');
        }

        const badgeAssignment = {
            badgeId: badgeAssignmentData.badgeId,
            userId: badgeAssignmentData.userId,
            awardedAt: new Date()
        };
        
        const response = await UserBadgeRepository.save(badgeAssignment);
        return response;
    }

    public async getMyBadges(userId: string) {
        const UserBadgeRepository = AppDataSource.getRepository(UserBadge);
        const userBadges = await UserBadgeRepository.find({
            where: { userId: userId },
            relations: ['badge']
        });
        return userBadges.map(ub => ub.badge);
    }
}