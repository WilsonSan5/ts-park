import { Router } from 'express';
import * as gymController from '../controllers/gym.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../types';

const router = Router();

// All gym routes require authentication
router.use(authenticateToken);

/**
 * Public routes (all authenticated users)
 */

// Get all approved gyms
// GET /api/gyms
router.get('/', gymController.getAllGyms);

// Get gym by ID
// GET /api/gyms/:id
router.get('/:id', gymController.getGymById);

// Get gyms by owner
// GET /api/gyms/owner/:ownerId
router.get('/owner/:ownerId', gymController.getGymsByOwner);

/**
 * Gym Owner only routes
 */

// Create new gym
// POST /api/gyms
router.post('/', requireRole([UserRole.GYM_OWNER]), gymController.createGym);

/**
 * Owner or Super Admin only routes
 */

// Update gym
// PATCH /api/gyms/:id
router.patch('/:id', gymController.updateGym);

/**
 * Super Admin only routes
 */

// Approve gym
// PATCH /api/gyms/:id/approve
router.patch('/:id/approve', requireRole([UserRole.SUPER_ADMIN]), gymController.approveGym);

export default router;
