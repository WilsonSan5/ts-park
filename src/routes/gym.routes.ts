import { Router } from 'express';
import * as gymController from '../controllers/gym.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateDTO, validateUUIDParam, ValidationSource } from '../middleware/validate.middleware';
import { CreateGymDTO, UpdateGymDTO, GymQueryDTO } from '../dtos';
import { UserRole } from '../types';

const router = Router();

// All gym routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/gyms:
 *   get:
 *     summary: Get all approved gyms
 *     description: Retrieve all approved gyms with optional filters
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *         example: "Paris"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name and description
 *         example: "fitness"
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *     responses:
 *       200:
 *         description: Gyms retrieved successfully
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
 *                     $ref: '#/components/schemas/Gym'
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new gym
 *     description: Create a new gym (gym_owner only). Requires approval by super_admin.
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGymDTO'
 *           example:
 *             name: "FitZone Paris"
 *             description: "Premium fitness center in the heart of Paris"
 *             address: "123 Avenue des Champs-Elysees"
 *             city: "Paris"
 *             country: "France"
 *             postalCode: "75008"
 *             phone: "+33 1 23 45 67 89"
 *             email: "contact@fitzone-paris.com"
 *             specializedExerciseTypes: ["cardio", "strength", "yoga"]
 *     responses:
 *       201:
 *         description: Gym created successfully (pending approval)
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires gym_owner role
 */

/**
 * @swagger
 * /api/gyms/{id}:
 *   get:
 *     summary: Get gym by ID
 *     description: Retrieve a specific gym by its ID
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gym ID
 *     responses:
 *       200:
 *         description: Gym retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Gym'
 *       404:
 *         description: Gym not found
 *
 *   patch:
 *     summary: Update gym
 *     description: Update an existing gym (owner or super_admin only)
 *     tags: [Gyms]
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
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Gym updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Gym not found
 */

/**
 * @swagger
 * /api/gyms/owner/{ownerId}:
 *   get:
 *     summary: Get gyms by owner
 *     description: Retrieve all gyms owned by a specific user
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Owner's user ID
 *     responses:
 *       200:
 *         description: Gyms retrieved successfully
 *       404:
 *         description: Owner not found
 */

/**
 * @swagger
 * /api/gyms/{id}/approve:
 *   patch:
 *     summary: Approve a gym
 *     description: Approve a pending gym (super_admin only)
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gym ID to approve
 *     responses:
 *       200:
 *         description: Gym approved successfully
 *       403:
 *         description: Forbidden - requires super_admin role
 *       404:
 *         description: Gym not found
 */

// Get all approved gyms
// GET /api/gyms?city=Paris&search=fitness
router.get('/', validateDTO(GymQueryDTO, ValidationSource.QUERY), gymController.getAllGyms);

// Get gym by ID
// GET /api/gyms/:id
router.get('/:id', validateUUIDParam('id'), gymController.getGymById);

// Get gyms by owner
// GET /api/gyms/owner/:ownerId
router.get('/owner/:ownerId', validateUUIDParam('ownerId'), gymController.getGymsByOwner);

/**
 * Gym Owner only routes
 */

// Create new gym
// POST /api/gyms
router.post('/', requireRole([UserRole.GYM_OWNER]), validateDTO(CreateGymDTO), gymController.createGym);

/**
 * Owner or Super Admin only routes
 */

// Update gym
// PATCH /api/gyms/:id
router.patch(
  '/:id',
  requireRole([UserRole.GYM_OWNER, UserRole.SUPER_ADMIN]),
  validateUUIDParam('id'),
  validateDTO(UpdateGymDTO),
  gymController.updateGym
);

/**
 * Super Admin only routes
 */

// Approve gym
// PATCH /api/gyms/:id/approve
router.patch(
  '/:id/approve',
  requireRole([UserRole.SUPER_ADMIN]),
  validateUUIDParam('id'),
  gymController.approveGym
);

export default router;
