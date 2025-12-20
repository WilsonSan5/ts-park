import { AppDataSource } from '@config/database';
import { BadgeRule } from '../models/BadgeRule';
import { Badge } from '../models/Badge';
import { UserBadge } from '../models/UserBadge';
import { Participation } from '../models/Participation';
import { Workout } from '../models/Workout';
import { User } from '../models/User';
import { ParticipationStatus, NotificationType } from '../types';
import { Not, IsNull } from 'typeorm';
import * as notificationService from './notification.service';

export class BadgeRuleService {
  /**
   * Get count of completed challenges for a user
   */
  private async getChallengesCompleted(userId: string): Promise<number> {
    const participationRepository = AppDataSource.getRepository(Participation);

    const count = await participationRepository.count({
      where: {
        userId,
        status: ParticipationStatus.COMPLETED,
        completedAt: Not(IsNull()),
      },
    });

    return count;
  }

  /**
   * Get total calories burned across all workouts for a user
   */
  private async getTotalCalories(userId: string): Promise<number> {
    const workoutRepository = AppDataSource.getRepository(Workout);

    const result = await workoutRepository
      .createQueryBuilder('workout')
      .select('SUM(workout.caloriesBurned)', 'total')
      .where('workout.userId = :userId', { userId })
      .getRawOne();

    return result?.total ? parseInt(result.total) : 0;
  }

  /**
   * Get total number of workouts for a user
   */
  private async getTotalWorkouts(userId: string): Promise<number> {
    const workoutRepository = AppDataSource.getRepository(Workout);

    const count = await workoutRepository.count({
      where: { userId },
    });

    return count;
  }

  /**
   * Get user's total points
   */
  private async getTotalPoints(userId: string): Promise<number> {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: userId },
      select: ['totalPoints'],
    });

    return user?.totalPoints || 0;
  }

  /**
   * Evaluate a rule operator
   * @param actual - Actual value
   * @param operator - Comparison operator
   * @param target - Target value
   * @returns True if condition is met
   */
  private evaluateOperator(actual: number, operator: string, target: number): boolean {
    switch (operator) {
      case '>=':
        return actual >= target;
      case '>':
        return actual > target;
      case '=':
      case '==':
        return actual === target;
      case '<':
        return actual < target;
      case '<=':
        return actual <= target;
      default:
        throw new Error(`Invalid operator: ${operator}`);
    }
  }

  /**
   * Get badges with rules that the user hasn't earned yet
   */
  private async getUnawardedBadgesWithRules(userId: string): Promise<Badge[]> {
    const badgeRepository = AppDataSource.getRepository(Badge);

    // Get all badges with their rules
    const badges = await badgeRepository
      .createQueryBuilder('badge')
      .leftJoinAndSelect('badge.user', 'creator')
      .leftJoin('badge_rules', 'rule', 'rule.badgeId = badge.id')
      .leftJoin(
        'user_badges',
        'userBadge',
        'userBadge.badgeId = badge.id AND userBadge.userId = :userId',
        { userId }
      )
      .where('badge.isActive = :isActive', { isActive: true })
      .andWhere('rule.id IS NOT NULL') // Badge must have at least one rule
      .andWhere('userBadge.id IS NULL') // User hasn't earned this badge yet
      .getMany();

    return badges;
  }

  /**
   * Get all rules for a specific badge
   */
  private async getBadgeRulesInternal(badgeId: string): Promise<BadgeRule[]> {
    const badgeRuleRepository = AppDataSource.getRepository(BadgeRule);

    const rules = await badgeRuleRepository.find({
      where: { badgeId },
    });

    return rules;
  }

  /**
   * Get actual value for a rule type
   */
  private async getActualValue(userId: string, ruleType: string): Promise<number> {
    switch (ruleType) {
      case 'challenges_completed':
        return await this.getChallengesCompleted(userId);
      case 'total_calories':
        return await this.getTotalCalories(userId);
      case 'total_workouts':
        return await this.getTotalWorkouts(userId);
      case 'total_points':
        return await this.getTotalPoints(userId);
      default:
        throw new Error(`Invalid rule type: ${ruleType}`);
    }
  }

  /**
   * Award a badge to a user
   */
  private async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const userBadgeRepository = AppDataSource.getRepository(UserBadge);
    const badgeRepository = AppDataSource.getRepository(Badge);
    const userRepository = AppDataSource.getRepository(User);

    return await AppDataSource.transaction(async (manager) => {
      // Check if badge already awarded (prevent race conditions)
      const existing = await manager.findOne(UserBadge, {
        where: { userId, badgeId },
      });

      if (existing) {
        return existing;
      }

      // Get badge to add points to user
      const badge = await manager.findOne(Badge, {
        where: { id: badgeId },
      });

      if (!badge) {
        throw new Error('Badge not found');
      }

      // Award badge
      const userBadge = manager.create(UserBadge, {
        userId,
        badgeId,
      });

      const savedUserBadge = await manager.save(UserBadge, userBadge);

      // Update user's total points
      const user = await manager.findOne(User, {
        where: { id: userId },
      });

      if (user) {
        user.totalPoints += badge.pointsValue;
        await manager.save(User, user);
      }

      // Send notification to user about badge award
      await notificationService.createNotification(
        userId,
        NotificationType.BADGE_AWARDED,
        'Badge Earned!',
        `Congratulations! You earned the "${badge.name}" badge`
      );

      return savedUserBadge;
    });
  }

  /**
   * Evaluate all badge rules for a user and award badges if conditions are met
   * @param userId - User ID to evaluate
   * @returns Array of newly awarded UserBadge entries
   */
  public async evaluateRulesForUser(userId: string): Promise<UserBadge[]> {
    const awardedBadges: UserBadge[] = [];

    // Get badges that user hasn't earned yet
    const unawardedBadges = await this.getUnawardedBadgesWithRules(userId);

    // Evaluate each badge
    for (const badge of unawardedBadges) {
      const rules = await this.getBadgeRulesInternal(badge.id);

      if (rules.length === 0) {
        continue;
      }

      // Check if ALL rules pass
      let allRulesPass = true;

      for (const rule of rules) {
        const actualValue = await this.getActualValue(userId, rule.ruleType);
        const passes = this.evaluateOperator(actualValue, rule.operator, rule.targetValue);

        if (!passes) {
          allRulesPass = false;
          break;
        }
      }

      // If all rules pass, award the badge
      if (allRulesPass) {
        const userBadge = await this.awardBadge(userId, badge.id);
        awardedBadges.push(userBadge);
      }
    }

    return awardedBadges;
  }
}
