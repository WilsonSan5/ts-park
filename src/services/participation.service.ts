import { AppDataSource } from '@config/database';
import { Participation } from '../models/Participation';
import { Workout } from '../models/Workout';
import { User } from '../models/User';
import { ParticipationStatus, ChallengeProgress, ChallengeObjectives, NotificationType } from '../types';
import { In } from 'typeorm';
import { BadgeRuleService } from './badge-rule.service';
import * as notificationService from './notification.service';

export class ParticipationService {
  private badgeRuleService: BadgeRuleService;

  constructor() {
    this.badgeRuleService = new BadgeRuleService();
  }
  /**
   * Update progress for all active participations when a workout is logged
   * @param userId - The user who logged the workout
   * @param workout - The workout that was logged
   */
  public async updateProgressFromWorkout(userId: string, workout: Workout): Promise<void> {
    const participationRepository = AppDataSource.getRepository(Participation);

    // Find all active participations for this user (JOINED or IN_PROGRESS)
    const activeParticipations = await participationRepository.find({
      where: {
        userId,
        status: In([ParticipationStatus.JOINED, ParticipationStatus.IN_PROGRESS]),
      },
      relations: ['challenge'],
    });

    // Update progress for each active participation
    for (const participation of activeParticipations) {
      // Update status to IN_PROGRESS if currently JOINED
      if (participation.status === ParticipationStatus.JOINED) {
        participation.status = ParticipationStatus.IN_PROGRESS;
      }

      // Update progress metrics
      const progress = participation.progress;
      progress.currentWorkouts += 1;
      progress.currentCalories += workout.caloriesBurned;
      progress.currentDuration += workout.duration;

      // Calculate completion percentage
      progress.completionPercentage = this.calculateCompletion(
        progress,
        participation.challenge.objectives
      );

      // Save updated participation
      participation.progress = progress;
      await participationRepository.save(participation);

      // Check if challenge is now completed
      await this.checkAndCompleteChallenge(participation);
    }
  }

  /**
   * Calculate completion percentage based on objectives
   * @param progress - Current progress
   * @param objectives - Challenge objectives
   * @returns Completion percentage (0-100)
   */
  public calculateCompletion(
    progress: ChallengeProgress,
    objectives: ChallengeObjectives
  ): number {
    const percentages: number[] = [];

    // Calculate percentage for each objective type
    if (objectives.targetWorkouts !== undefined && objectives.targetWorkouts > 0) {
      const workoutPercentage = (progress.currentWorkouts / objectives.targetWorkouts) * 100;
      percentages.push(Math.min(workoutPercentage, 100));
    }

    if (objectives.targetCalories !== undefined && objectives.targetCalories > 0) {
      const caloriePercentage = (progress.currentCalories / objectives.targetCalories) * 100;
      percentages.push(Math.min(caloriePercentage, 100));
    }

    if (objectives.targetDuration !== undefined && objectives.targetDuration > 0) {
      const durationPercentage = (progress.currentDuration / objectives.targetDuration) * 100;
      percentages.push(Math.min(durationPercentage, 100));
    }

    // If no objectives are set, return 0
    if (percentages.length === 0) {
      return 0;
    }

    // Return average of all objective percentages, capped at 100%
    const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    return Math.min(average, 100);
  }

  /**
   * Check if a participation has reached 100% completion and mark as completed
   * @param participation - The participation to check
   * @returns True if the participation was completed, false otherwise
   */
  public async checkAndCompleteChallenge(participation: Participation): Promise<boolean> {
    // Check if completion percentage is 100% or more
    if (participation.progress.completionPercentage >= 100) {
      const participationRepository = AppDataSource.getRepository(Participation);
      const userRepository = AppDataSource.getRepository(User);

      // Update participation status
      participation.status = ParticipationStatus.COMPLETED;
      participation.completedAt = new Date();
      participation.pointsEarned = participation.challenge.pointsReward;

      // Update user's total points
      const user = await userRepository.findOne({
        where: { id: participation.userId },
      });

      if (user) {
        user.totalPoints += participation.pointsEarned;
        await userRepository.save(user);
      }

      // Save participation
      await participationRepository.save(participation);

      // Send notification to user about challenge completion
      await notificationService.createNotification(
        participation.userId,
        NotificationType.CHALLENGE_COMPLETED,
        'Challenge Completed!',
        `Congratulations! You completed the "${participation.challenge.title}" challenge and earned ${participation.pointsEarned} points`
      );

      // Evaluate badge rules after completing a challenge
      await this.badgeRuleService.evaluateRulesForUser(participation.userId);

      return true;
    }

    return false;
  }
}
