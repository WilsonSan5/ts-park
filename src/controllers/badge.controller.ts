import { Request, Response, Router } from 'express';
import { BadgeService } from '../services/badge.service';
import { Badge, BadgeAssignment } from '../types';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateDTO, validateUUIDParam } from '../middleware/validate.middleware';
import { CreateBadgeDTO, UpdateBadgeDTO, CreateBadgeRuleDTO, AssignBadgeDTO } from '../dtos';
import { sendSuccess, sendCreated } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';
import { AppDataSource } from '@config/database';
import { User } from '../models/User';
import { UserRole } from '../types';

/**
 * @swagger
 * /api/badges:
 *   get:
 *     summary: Get my badges
 *     description: Retrieve all badges earned by the authenticated user
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Badges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Badge'
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new badge
 *     description: Create a new badge (super_admin only)
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBadgeDTO'
 *           example:
 *             name: "Workout Warrior"
 *             description: "Awarded for completing 100 workouts"
 *             icon: "trophy"
 *             pointsValue: 100
 *             isActive: true
 *     responses:
 *       201:
 *         description: Badge created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires super_admin role
 */

/**
 * @swagger
 * /api/badges/available:
 *   get:
 *     summary: Get all available badges
 *     description: Retrieve all active badges that can be earned
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Badges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 10
 *                     badges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Badge'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/badges/assign:
 *   post:
 *     summary: Assign badge to user
 *     description: Manually assign a badge to a user (super_admin only)
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - badgeId
 *               - userId
 *             properties:
 *               badgeId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440001"
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440002"
 *     responses:
 *       201:
 *         description: Badge assigned successfully
 *       400:
 *         description: Badge or user not found
 *       403:
 *         description: Forbidden - requires super_admin role
 */

/**
 * @swagger
 * /api/badges/{id}:
 *   get:
 *     summary: Get badge by ID
 *     description: Retrieve a specific badge by its ID
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Badge ID
 *     responses:
 *       200:
 *         description: Badge retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Badge'
 *       404:
 *         description: Badge not found
 *
 *   patch:
 *     summary: Update badge
 *     description: Update an existing badge (super_admin only)
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               pointsValue:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Badge updated successfully
 *       403:
 *         description: Forbidden - requires super_admin role
 *       404:
 *         description: Badge not found
 *
 *   delete:
 *     summary: Delete badge (soft)
 *     description: Soft-delete an existing badge (super_admin only). Badge is preserved for history.
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Badge deleted successfully
 *       403:
 *         description: Forbidden - requires super_admin role
 *       404:
 *         description: Badge not found
 */

/**
 * @swagger
 * /api/badges/deleted:
 *   get:
 *     summary: Get deleted badges
 *     description: Retrieve all soft-deleted badges for recovery (super_admin only)
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deleted badges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                     badges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Badge'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires super_admin role
 */

/**
 * @swagger
 * /api/badges/{id}/restore:
 *   post:
 *     summary: Restore a deleted badge
 *     description: Restore a soft-deleted badge (super_admin only)
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Badge ID
 *     responses:
 *       200:
 *         description: Badge restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Badge restored successfully
 *                 data:
 *                   $ref: '#/components/schemas/Badge'
 *       400:
 *         description: Badge is not deleted
 *       403:
 *         description: Forbidden - requires super_admin role
 *       404:
 *         description: Badge not found
 */

/**
 * @swagger
 * /api/badges/{badgeId}/rules:
 *   get:
 *     summary: Get badge rules
 *     description: Retrieve all rules for a specific badge
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: badgeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Badge ID
 *     responses:
 *       200:
 *         description: Rules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                     rules:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BadgeRule'
 *       404:
 *         description: Badge not found
 *
 *   post:
 *     summary: Create badge rule
 *     description: Create a new rule for automatic badge awarding (super_admin only)
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: badgeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBadgeRuleDTO'
 *           example:
 *             ruleType: "total_workouts"
 *             operator: ">="
 *             targetValue: 100
 *             description: "Complete at least 100 workouts"
 *     responses:
 *       201:
 *         description: Rule created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - requires super_admin role
 *       404:
 *         description: Badge not found
 */

/**
 * @swagger
 * /api/badges/rules/{ruleId}:
 *   delete:
 *     summary: Delete badge rule
 *     description: Delete a badge rule (super_admin only)
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Rule ID
 *     responses:
 *       200:
 *         description: Rule deleted successfully
 *       403:
 *         description: Forbidden - requires super_admin role
 *       404:
 *         description: Rule not found
 */

export class BadgeController {
  readonly badgeService: BadgeService;

  constructor(badgeService: BadgeService) {
    this.badgeService = badgeService;
  }

  buildRouter(): Router {
    const router = Router();
    router.use(authenticateToken);

    // Badge creation (Super Admin only)
    router.post('/', validateDTO(CreateBadgeDTO), asyncHandler(this.createBadge.bind(this)));

    // Badge listing (all authenticated users)
    router.get('/available', asyncHandler(this.getAllBadges.bind(this)));

    // Deleted badges (Super Admin only) - must be before /:id
    router.get('/deleted', asyncHandler(this.getDeletedBadges.bind(this)));

    // My badges (authenticated user)
    router.get('/', asyncHandler(this.getMyBadges.bind(this)));

    // Badge assignment (Super Admin only)
    router.post('/assign', validateDTO(AssignBadgeDTO), asyncHandler(this.assignBadge.bind(this)));

    // Badge rule management (Super Admin only)
    router.post('/:badgeId/rules', validateUUIDParam('badgeId'), validateDTO(CreateBadgeRuleDTO), asyncHandler(this.createBadgeRule.bind(this)));
    router.get('/:badgeId/rules', validateUUIDParam('badgeId'), asyncHandler(this.getBadgeRules.bind(this)));
    router.delete('/rules/:ruleId', validateUUIDParam('ruleId'), asyncHandler(this.deleteBadgeRule.bind(this)));

    // Badge by ID (before /:id routes)
    router.get('/:id', validateUUIDParam('id'), asyncHandler(this.getBadgeByIdHandler.bind(this)));

    // Badge management (Super Admin only)
    router.patch('/:id', validateUUIDParam('id'), validateDTO(UpdateBadgeDTO), asyncHandler(this.updateBadge.bind(this)));
    router.delete('/:id', validateUUIDParam('id'), asyncHandler(this.deleteBadge.bind(this)));

    // Restore deleted badge (Super Admin only)
    router.post('/:id/restore', validateUUIDParam('id'), asyncHandler(this.restoreBadge.bind(this)));

    return router;
  }

  /**
   * Get all available badges
   * GET /api/badges/available
   */
  async getAllBadges(req: Request, res: Response): Promise<Response> {
    const badges = await this.badgeService.getAllActiveBadges();
    return sendSuccess(res, 'Badges retrieved successfully', {
      count: badges.length,
      badges
    });
  }

  /**
   * Get badge by ID
   * GET /api/badges/:id
   */
  async getBadgeByIdHandler(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const badge = await this.badgeService.getBadgeById(id);
    return sendSuccess(res, 'Badge retrieved successfully', badge);
  }

  /**
   * Create badge
   * POST /api/badges
   * Super Admin only
   */
  async createBadge(req: Request, res: Response): Promise<Response> {
    const { name, description, icon, pointsValue, isActive } = req.body;
    const createdBy = req.user!.userId;

    // Check Permissions
    const userRepository = AppDataSource.getRepository(User);
    const creator = await userRepository.findOne({ where: { id: createdBy } });
    if (!creator || creator.role !== UserRole.SUPER_ADMIN) {
      throw new Error('Only super administrators can create badges');
    }

    const badgeData: Badge = {
      name,
      description,
      icon,
      pointsValue,
      isActive: isActive ?? true,
      createdAt: new Date(),
      createdBy
    };

    const badge = await this.badgeService.createBadge(badgeData);
    return sendCreated(res, 'Badge created successfully', badge);
  }

  /**
   * Update badge
   * PATCH /api/badges/:id
   * Super Admin only
   */
  async updateBadge(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const updateData = req.body;

    const badge = await this.badgeService.updateBadge(id, updateData, req.user!.userId);
    return sendSuccess(res, 'Badge updated successfully', badge);
  }

  /**
   * Delete badge
   * DELETE /api/badges/:id
   * Super Admin only
   */
  async deleteBadge(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    await this.badgeService.deleteBadge(id, req.user!.userId);
    return sendSuccess(res, 'Badge deleted successfully', null);
  }

  /**
   * Assign badge to user
   * POST /api/badges/assign
   * Super Admin only
   */
  async assignBadge(req: Request, res: Response): Promise<Response> {
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
    return sendCreated(res, 'Badge assigned successfully', assignedBadge);
  }

  /**
   * Get my badges
   * GET /api/badges
   */
  async getMyBadges(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.userId;
    const badges = await this.badgeService.getMyBadges(userId);
    return sendSuccess(res, 'Badges retrieved successfully', badges);
  }

  /**
   * Create a badge rule
   * POST /api/badges/:badgeId/rules
   * Super Admin only
   */
  async createBadgeRule(req: Request, res: Response): Promise<Response> {
    const { badgeId } = req.params;
    const { ruleType, operator, targetValue, description } = req.body;

    const rule = await this.badgeService.createBadgeRule(
      badgeId,
      { ruleType, operator, targetValue, description },
      req.user!.userId
    );

    return sendCreated(res, 'Badge rule created successfully', rule);
  }

  /**
   * Get all rules for a badge
   * GET /api/badges/:badgeId/rules
   */
  async getBadgeRules(req: Request, res: Response): Promise<Response> {
    const { badgeId } = req.params;
    const rules = await this.badgeService.getBadgeRules(badgeId);
    return sendSuccess(res, 'Badge rules retrieved successfully', {
      count: rules.length,
      rules
    });
  }

  /**
   * Delete a badge rule
   * DELETE /api/badges/rules/:ruleId
   * Super Admin only
   */
  async deleteBadgeRule(req: Request, res: Response): Promise<Response> {
    const { ruleId } = req.params;
    await this.badgeService.deleteBadgeRule(ruleId, req.user!.userId);
    return sendSuccess(res, 'Badge rule deleted successfully', null);
  }

  /**
   * Get all deleted badges
   * GET /api/badges/deleted
   * Super Admin only
   */
  async getDeletedBadges(req: Request, res: Response): Promise<Response> {
    const badges = await this.badgeService.getDeletedBadges(req.user!.userId);
    return sendSuccess(res, 'Deleted badges retrieved successfully', {
      count: badges.length,
      badges
    });
  }

  /**
   * Restore a soft-deleted badge
   * POST /api/badges/:id/restore
   * Super Admin only
   */
  async restoreBadge(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const badge = await this.badgeService.restoreBadge(id, req.user!.userId);
    return sendSuccess(res, 'Badge restored successfully', badge);
  }
}
