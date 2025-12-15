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

        const badgeAssignment = {
            badgeId: badgeAssignmentData.badgeId,
            userId: badgeAssignmentData.userId,
            awardedAt: new Date()
        };

        const UserBadgeRepository = AppDataSource.getRepository(UserBadge);
        const response = await UserBadgeRepository.save(badgeAssignment);
        return response;
    }

    public async getMyBadges(userId: string) {
        const badgeRepository = AppDataSource.getRepository(BadgeModel);
        const badges = await badgeRepository.find({ where: { createdBy: userId } });
        return badges;
    }
}