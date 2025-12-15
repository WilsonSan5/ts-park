import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import exerciseRoutes from './exercise.routes';
import gymRoutes from './gym.routes';
import challengeRoutes from './challenge.routes';
import workoutRoutes from './workout.routes';
import badgeRoutes from './badge.routes';
import socialRoutes from './social.routes';
// Import other routes as they are implemented
// import badgeRoutes from './badge.routes';

/**
 * 🎓 LEARNING: Main Router (Central Route Registration)
 *
 * WHAT IS THIS FILE?
 * ==================
 * This is the "main router" - it collects all feature routers
 * and registers them with URL prefixes.
 *
 * WHY CENTRALIZE ROUTES?
 * - Organization: All routes registered in one place
 * - Consistency: All features follow same URL structure
 * - Maintainability: Easy to see all API endpoints
 * - Modularity: Each feature has its own router file
 *
 * URL STRUCTURE:
 * /api (set in app.ts)
 *   ├─ /auth       → Authentication endpoints
 *   │   ├─ POST /register
 *   │   ├─ POST /login
 *   │   └─ GET  /me
 *   ├─ /exercises  → Exercise management (COMPLETED)
 *   ├─ /users      → User management (TODO)
 *   ├─ /gyms       → Gym management (TODO)
 *   └─ /challenges → Challenge management (TODO)
 *
 * FULL URL EXAMPLE:
 * http://localhost:3000/api/auth/register
 *                       ↑    ↑    ↑
 *                       |    |    |
 *                   API prefix | Route path
 *                   (app.ts)   | (auth.routes.ts)
 *                              |
 *                         Router prefix
 *                         (this file)
 */

const router = Router();

/**
 * REGISTER ROUTES
 * ===============
 * Each router.use() registers a feature's routes with a URL prefix
 */

// ✅ AUTHENTICATION ROUTES (Phase 2 - COMPLETED!)
router.use('/auth', authRoutes);
// Endpoints available:
// - POST /api/auth/register
// - POST /api/auth/login
// - GET  /api/auth/me

// ✅ USER ROUTES (Phase 3 - COMPLETED!)
router.use('/users', userRoutes);
// Endpoints available:
// - GET    /api/users (Super Admin only)
// - GET    /api/users/:id (own profile or Super Admin)
// - PATCH  /api/users/:id (own profile or Super Admin)
// - PATCH  /api/users/:id/password (own profile only)
// - DELETE /api/users/:id (Super Admin only)
// - GET    /api/users/:id/stats (own stats or Super Admin)

// ✅ EXERCISE ROUTES (Phase 6 - Already completed)
router.use('/exercises', exerciseRoutes);


// Register other routes as they are implemented
router.use('/gyms', gymRoutes);
router.use('/challenges', challengeRoutes);
router.use('/workouts', workoutRoutes);
router.use('/gyms', gymRoutes);
router.use('/challenges', challengeRoutes);
router.use('/badges', badgeRoutes);
// router.use('/social', socialRoutes);

// ✅ SOCIAL/FRIENDSHIP ROUTES (Phase 9 - COMPLETED!)
router.use('/friends', socialRoutes);
// Endpoints available:
// - GET    /api/friends                 (list all friends)
// - GET    /api/friends/pending         (list pending requests received)
// - GET    /api/friends/sent            (list sent requests)
// - GET    /api/friends/status/:userId  (get friendship status)
// - POST   /api/friends/request         (send friend request)
// - POST   /api/friends/:id/accept      (accept friend request)
// - POST   /api/friends/:id/reject      (reject friend request)
// - DELETE /api/friends/:id             (remove friend)

// router.use('/badges', badgeRoutes);

/**
 * 🎓 ROUTE REGISTRATION ORDER
 * ===========================
 *
 * Order typically doesn't matter, but best practices:
 * 1. Authentication first (foundational)
 * 2. User management
 * 3. Resource management (gyms, exercises)
 * 4. Feature routes (challenges, workouts)
 * 5. Social features last
 *
 * WHY THIS ORDER?
 * Reflects dependency hierarchy - auth is needed by all,
 * then users, then specific features
 */

export default router;

/**
 * 🎓 NEXT STEPS FOR TEAM
 * ======================
 *
 * Now that Phase 2 (Authentication) is complete:
 *
 * ✅ Person 1 can:
 *    - Test authentication endpoints
 *    - Move to Phase 3 (User Management)
 *    - Implement user.service.ts, user.controller.ts, user.routes.ts
 *
 * ✅ Person 2 can:
 *    - Start Phase 4 (Gym Management)
 *    - Implement gym.service.ts, gym.controller.ts, gym.routes.ts
 *    - Use auth.service.ts and exercise.service.ts as reference
 *
 * ✅ Person 3 can:
 *    - Start Phase 7 (Workout Tracking) or Phase 9 (Social)
 *    - Implement workout.service.ts, workout.controller.ts, workout.routes.ts
 *    - Follow the same pattern established here
 *
 * ALL FEATURES NOW HAVE ACCESS TO:
 * - authenticateToken middleware (protect routes)
 * - requireRole middleware (check user roles)
 * - User authentication system (login, register, JWT)
 */
