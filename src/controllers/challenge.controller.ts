import { Request, Response, Router } from 'express';
import { ChallengeService } from '../services/challenge.service';
import { Challenge } from '../models/Challenge';
import { ChallengeType, ChallengeStatus } from '../types/index';
import { User } from 'models/User';

export class ChallengeController {
    readonly challengeService: ChallengeService;

    constructor(challengeService: ChallengeService) {
        this.challengeService = challengeService;
    }

    async createChallenge(req: Request, res: Response) {
        try {
            const { title, description, difficulty, duration, reward, userId, startDate, endDate, type, status, objectives, pointsReward, isPublic, recommendedExercises } = req.body;
            const challengeData: Challenge = {
                id: '', // Will be generated
                title,
                description,
                difficulty,
                createdAt: new Date(),
                creatorId: userId,
                type: ChallengeType.INDIVIDUAL,
                status: ChallengeStatus.ACTIVE,
                objectives: objectives,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                pointsReward: pointsReward,
                isPublic: isPublic,
                updatedAt: new Date(),
                creator: new User,
                recommendedExercises: []
            }

            const challenge = await this.challengeService.createChallenge(challengeData);
            return res.status(201).json(challenge);
        } catch (error: any) {
            return res.status(500).json({ message: error.message || 'Failed to create challenge' });
        }
    }

    async getAllChallenges(_req: Request, res: Response) {
        try {
            const challenges = await this.challengeService.getAllChallenges();
            return res.status(200).json(challenges);
        } catch (error: any) {
            return res.status(500).json({ message: error.message || 'Failed to retrieve challenges' });
        }
    }

    buildRouter(): Router {
        const router = Router();
        router.post('/', this.createChallenge.bind(this));
        router.get('/', this.getAllChallenges.bind(this));
        return router;
    }
}