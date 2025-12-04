import { Router } from 'express';
import {
  listUsers,
  getUser,
  updateProfile,
  changePassword,
  removeUser,
  getStats,
} from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../types';

const router = Router();

router.get('/', authenticateToken, requireRole([UserRole.SUPER_ADMIN]), listUsers);

router.get('/:id', authenticateToken, getUser);

router.patch('/:id', authenticateToken, updateProfile);

router.patch('/:id/password', authenticateToken, changePassword);

router.delete('/:id', authenticateToken, requireRole([UserRole.SUPER_ADMIN]), removeUser);

router.get('/:id/stats', authenticateToken, getStats);

export default router;
