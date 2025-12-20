import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import exerciseRoutes from './exercise.routes';
import gymRoutes from './gym.routes';
import challengeRoutes from './challenge.routes';
import workoutRoutes from './workout.routes';
import socialRoutes from './social.routes';
import badgeRoutes from './badge.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Authentication
router.use('/auth', authRoutes);

// User management
router.use('/users', userRoutes);

// Exercise management
router.use('/exercises', exerciseRoutes);

// Gym management
router.use('/gyms', gymRoutes);

// Challenge management
router.use('/challenges', challengeRoutes);

// Workout tracking
router.use('/workouts', workoutRoutes);

// Badge system
router.use('/badges', badgeRoutes);

// Social/Friendship
router.use('/friends', socialRoutes);

// Notifications
router.use('/notifications', notificationRoutes);

export default router;
