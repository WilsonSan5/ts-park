import { Router } from 'express';
import exerciseRoutes from './exercise.routes';
// Import other routes as they are implemented
// import authRoutes from './auth.routes';
// import userRoutes from './user.routes';
// import gymRoutes from './gym.routes';
// import challengeRoutes from './challenge.routes';
// import workoutRoutes from './workout.routes';
// import badgeRoutes from './badge.routes';
// import socialRoutes from './social.routes';

const router = Router();

// Register all routes
router.use('/exercises', exerciseRoutes);

// Register other routes as they are implemented
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/gyms', gymRoutes);
// router.use('/challenges', challengeRoutes);
// router.use('/workouts', workoutRoutes);
// router.use('/badges', badgeRoutes);
// router.use('/social', socialRoutes);

export default router;
