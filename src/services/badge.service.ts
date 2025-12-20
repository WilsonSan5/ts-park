import { IsNull } from 'typeorm';
import { AppDataSource } from '@config/database';
import { Badge as BadgeModel } from '../models/Badge';
import { UserBadge } from 'models/UserBadge';
import { BadgeRule } from '../models/BadgeRule';
import { User } from '../models/User';
import { BadgeAssignment, Badge, UserRole } from '../types';

export class BadgeService {
    public async createBadge(badgeData: Badge): Promise<BadgeModel> {
        const badgeRepository = AppDataSource.getRepository(BadgeModel);
        const badge = badgeRepository.create(badgeData);
        const responses = await badgeRepository.save(badge);
        return responses; // Return the created workout data
    }

    public async assignBadge(badgeAssignmentData: BadgeAssignment): Promise<UserBadge> {
        // Check if badge and user exist (exclude soft-deleted badges)
        const badgeRepository = AppDataSource.getRepository(BadgeModel);
        const badge = await badgeRepository.findOne({
            where: {
                id: badgeAssignmentData.badgeId,
                deletedAt: IsNull() // Exclude soft-deleted badges
            }
        });
        if (!badge) {
            throw new Error('Badge not found or has been deleted');
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

    public async getMyBadges(userId: string): Promise<UserBadge[]> {
        const userBadgeRepository = AppDataSource.getRepository(UserBadge);
        // Use QueryBuilder to filter out soft-deleted badges from relations
        const userBadges = await userBadgeRepository
            .createQueryBuilder('userBadge')
            .leftJoinAndSelect('userBadge.badge', 'badge')
            .where('userBadge.userId = :userId', { userId })
            .andWhere('badge.deletedAt IS NULL') // Exclude soft-deleted badges
            .orderBy('userBadge.awardedAt', 'DESC')
            .getMany();
        return userBadges;
    }

    /**
     * Get all active badges
     * Returns all badges where isActive=true, ordered by name
     */
    public async getAllActiveBadges(): Promise<BadgeModel[]> {
        const badgeRepository = AppDataSource.getRepository(BadgeModel);
        const badges = await badgeRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' }
        });
        return badges;
    }

    /**
     * Get single badge by ID (excludes soft-deleted badges)
     */
    public async getBadgeById(id: string): Promise<BadgeModel> {
        const badgeRepository = AppDataSource.getRepository(BadgeModel);
        const badge = await badgeRepository.findOne({
            where: {
                id,
                deletedAt: IsNull() // Explicitly exclude soft-deleted badges
            },
            relations: ['user']
        });

        if (!badge) {
            throw new Error('Badge not found');
        }

        return badge;
    }

    /**
     * Update badge (Super Admin only)
     */
    public async updateBadge(id: string, data: Partial<Badge>, userId: string): Promise<BadgeModel> {
        // Verify user is Super Admin
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Only super administrators can update badges');
        }

        // Find badge
        const badgeRepository = AppDataSource.getRepository(BadgeModel);
        const badge = await badgeRepository.findOne({ where: { id } });
        if (!badge) {
            throw new Error('Badge not found');
        }

        // Security: Whitelist allowed fields to prevent mass assignment vulnerability
        // Protected fields: id, createdAt, updatedAt
        const allowedFields = [
            'name',
            'description',
            'icon',
            'pointsValue',
            'isActive'
        ] as const;

        // Only update whitelisted fields - type-safe assignment
        type AllowedField = typeof allowedFields[number];
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                (badge[field] as BadgeModel[AllowedField]) = data[field] as BadgeModel[AllowedField];
            }
        }

        return await badgeRepository.save(badge);
    }

    /**
     * Delete badge (Super Admin only)
     */
    public async deleteBadge(id: string, userId: string): Promise<void> {
        // Verify user is Super Admin
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Only super administrators can delete badges');
        }

        // Find badge
        const badgeRepository = AppDataSource.getRepository(BadgeModel);
        const badge = await badgeRepository.findOne({ where: { id } });
        if (!badge) {
            throw new Error('Badge not found');
        }

        // Use soft delete to preserve user badge history
        await badgeRepository.softRemove(badge);
    }

    /**
     * Get all deleted badges (Super Admin only)
     */
    public async getDeletedBadges(userId: string): Promise<BadgeModel[]> {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Only super administrators can view deleted badges');
        }

        const badgeRepository = AppDataSource.getRepository(BadgeModel);

        // Use query builder with withDeleted to get only soft-deleted badges
        const badges = await badgeRepository
            .createQueryBuilder('badge')
            .withDeleted()
            .where('badge.deletedAt IS NOT NULL')
            .orderBy('badge.deletedAt', 'DESC')
            .getMany();

        return badges;
    }

    /**
     * Restore a soft-deleted badge (Super Admin only)
     */
    public async restoreBadge(id: string, userId: string): Promise<BadgeModel> {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Only super administrators can restore badges');
        }

        const badgeRepository = AppDataSource.getRepository(BadgeModel);

        // Find including soft-deleted records
        const badge = await badgeRepository
            .createQueryBuilder('badge')
            .withDeleted()
            .where('badge.id = :id', { id })
            .getOne();

        if (!badge) {
            throw new Error('Badge not found');
        }

        if (!badge.deletedAt) {
            throw new Error('Badge is not deleted');
        }

        // Restore the badge
        await badgeRepository.recover(badge);

        // Reload to get fresh data
        const restored = await badgeRepository.findOne({ where: { id } });
        return restored!;
    }

    /**
     * Create a badge rule (Super Admin only)
     */
    public async createBadgeRule(
        badgeId: string,
        ruleData: { ruleType: string; operator: string; targetValue: number; description: string },
        userId: string
    ): Promise<BadgeRule> {
        // Verify user is Super Admin
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Only super administrators can create badge rules');
        }

        // Validate badge exists
        const badgeRepository = AppDataSource.getRepository(BadgeModel);
        const badge = await badgeRepository.findOne({ where: { id: badgeId } });
        if (!badge) {
            throw new Error('Badge not found');
        }

        // Validate ruleType
        const validRuleTypes = ['challenges_completed', 'total_calories', 'total_workouts', 'total_points'];
        if (!validRuleTypes.includes(ruleData.ruleType)) {
            throw new Error(`Invalid rule type. Must be one of: ${validRuleTypes.join(', ')}`);
        }

        // Validate operator
        const validOperators = ['>=', '>', '=', '<', '<='];
        if (!validOperators.includes(ruleData.operator)) {
            throw new Error(`Invalid operator. Must be one of: ${validOperators.join(', ')}`);
        }

        // Validate targetValue
        if (ruleData.targetValue <= 0) {
            throw new Error('Target value must be greater than 0');
        }

        // Create rule
        const badgeRuleRepository = AppDataSource.getRepository(BadgeRule);
        const rule = badgeRuleRepository.create({
            badgeId,
            ruleType: ruleData.ruleType,
            operator: ruleData.operator,
            targetValue: ruleData.targetValue,
            description: ruleData.description,
        });

        return await badgeRuleRepository.save(rule);
    }

    /**
     * Get all rules for a badge
     */
    public async getBadgeRules(badgeId: string): Promise<BadgeRule[]> {
        // Validate badge exists
        const badgeRepository = AppDataSource.getRepository(BadgeModel);
        const badge = await badgeRepository.findOne({ where: { id: badgeId } });
        if (!badge) {
            throw new Error('Badge not found');
        }

        const badgeRuleRepository = AppDataSource.getRepository(BadgeRule);
        const rules = await badgeRuleRepository.find({
            where: { badgeId },
            order: { ruleType: 'ASC' },
        });

        return rules;
    }

    /**
     * Delete a badge rule (Super Admin only)
     */
    public async deleteBadgeRule(ruleId: string, userId: string): Promise<void> {
        // Verify user is Super Admin
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Only super administrators can delete badge rules');
        }

        // Find rule
        const badgeRuleRepository = AppDataSource.getRepository(BadgeRule);
        const rule = await badgeRuleRepository.findOne({ where: { id: ruleId } });
        if (!rule) {
            throw new Error('Badge rule not found');
        }

        await badgeRuleRepository.remove(rule);
    }
}