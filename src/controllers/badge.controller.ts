import { Request, Response, Router } from 'express';
import { BadgeService } from '../services/badge.service';
import { Badge, BadgeAssignment } from '../types';
import { authenticateToken } from '../middleware/auth.middleware';
import { AppDataSource } from '@config/database';
import { User } from '../models/User'; // For permission checks
import { UserRole } from '../types'; // For permission checks

export class BadgeController {
    readonly badgeService: BadgeService;
    constructor(badgeService: BadgeService) {
        this.badgeService = badgeService;
    }

    buildRouter(): Router {
        const router = Router();
        router.use(authenticateToken);
        router.post('/', this.createBadge.bind(this));
        router.get('/', this.getMyBadges.bind(this));
        router.post('/assign', this.assignBadge.bind(this));
        return router;
    }

    async createBadge(req: Request, res: Response) {
        try {
            const { name, description, icon, pointsValue, isActive } = req.body;
            const createdBy = req.user!.userId;

            // Check Permissions
            const userRepository = AppDataSource.getRepository(User);
            const creator = await userRepository.findOne({ where: { id: createdBy } });
            if (!creator || creator.role !== UserRole.SUPER_ADMIN) {
                throw new Error('Only super administrators can create badges');
            }

            if (!name || !description || !icon || !pointsValue) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const badgeData: Badge = {
                name,
                description,
                icon,
                pointsValue,
                isActive,
                createdAt: new Date(),
                createdBy
            }
            const badge = await this.badgeService.createBadge(badgeData);
            return res.status(201).json(badge);
        } catch (error: any) {
            return res.status(500).json({ message: error.message || 'Failed to create badge' });
        }
    }

    async assignBadge(req: Request, res: Response) {
    // Check Permissions
    const superAdminId = req.user!.userId;
    const userRepository = AppDataSource.getRepository(User);
    const creator = await userRepository.findOne({ where: { id: superAdminId } });
    if (!creator || creator.role !== UserRole.SUPER_ADMIN) {
        throw new Error('Only super administrators can assign badges');
    }

    const { badgeId, userId } = req.body;
    const badgeAssignmentData: BadgeAssignment = {
        badgeId,
        userId,
        givenAt: new Date()
    };

    const assignedBadge = await this.badgeService.assignBadge(badgeAssignmentData);
    return res.status(201).json(assignedBadge);
}

    async getMyBadges(req: Request, res: Response) {
    try {
        const userId = req.user!.userId;
        const badges = await this.badgeService.getMyBadges(userId);
        return res.status(200).json(badges);
    } catch (error: any) {
        return res.status(500).json({ message: error.message || 'Failed to retrieve workouts' });
    }
}
}