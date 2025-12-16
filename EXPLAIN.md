# TSPark - Project Explanation for Presentation

This document explains the TSPark fitness challenge platform API, organized by team member contributions for the presentation.

---

## Part 1: Why This Architecture & Technology Choices

### Why PostgreSQL?

We chose PostgreSQL over other databases for several reasons:

1. **Relational Data Model**: Our platform has complex relationships (Users → Gyms → Challenges → Participations → Workouts). PostgreSQL excels at handling these relational structures with foreign keys, joins, and cascading operations.

2. **ACID Compliance**: Financial and points transactions (badge awards, points earned) require atomicity. If a user completes a challenge, we need to update their participation, award points, AND create badges in one transaction - if any fails, all should rollback.

3. **Array Support**: PostgreSQL natively supports arrays. We use this for:
   - `muscleGroups` in Exercise (e.g., `['chest', 'triceps', 'shoulders']`)
   - `equipment` in Gym (e.g., `['treadmill', 'weights', 'yoga_mat']`)
   - This avoids creating additional junction tables for simple lists.

4. **UUID Primary Keys**: PostgreSQL has native UUID support. We use UUIDs instead of auto-increment integers because:
   - Prevents ID enumeration attacks (can't guess `/api/users/2` from `/api/users/1`)
   - Allows generating IDs before database insert
   - Better for distributed systems

### Why TypeORM?

1. **TypeScript Integration**: Since our entire codebase is TypeScript, TypeORM provides type-safe queries and entity definitions.

2. **Decorators for Schema**: We define database schema using decorators directly on classes:
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;
}
```
This keeps schema definition close to the code that uses it.

3. **Migration System**: TypeORM generates migrations from entity changes, making database evolution trackable and reversible.

### Why Express 5?

1. **Mature Ecosystem**: Extensive middleware library, well-documented patterns
2. **Promise Support**: Express 5 has better async/await handling for error propagation
3. **Minimal Overhead**: Unlike full frameworks (NestJS), Express stays lightweight

### Security Packages Explained

#### Helmet (`helmet`)
**What it does**: Sets various HTTP headers to protect against common attacks.

```typescript
app.use(helmet());
```

This single line configures:
- `X-Content-Type-Options: nosniff` - Prevents browsers from MIME-sniffing
- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking via iframes
- `X-XSS-Protection: 1; mode=block` - Enables browser XSS filtering
- `Strict-Transport-Security` - Forces HTTPS connections
- Removes `X-Powered-By` header (hides Express)

Without Helmet, attackers could:
- Embed our site in an iframe and trick users (clickjacking)
- Inject malicious scripts via MIME confusion
- Know we're using Express and target known vulnerabilities

#### CORS (`cors`)
**What it does**: Controls which domains can make requests to our API.

```typescript
app.use(cors());
```

Without CORS, browsers would block any frontend application from accessing our API unless it's on the same domain. With CORS enabled, our React/Vue/Angular frontend on `localhost:3001` can call our API on `localhost:3000`.

#### Express Rate Limit (`express-rate-limit`)
**What it does**: Prevents abuse by limiting requests per IP address.

Protects against:
- Brute force login attempts
- API abuse / scraping
- Denial of Service (DoS) attacks

#### bcryptjs
**What it does**: Hashes passwords before storage.

```typescript
const hashedPassword = await hashPassword(password);  // "Test123!" → "$2a$10$..."
```

Why bcrypt specifically:
- Includes salt (random data) automatically - same password produces different hashes
- Computationally expensive - slows down brute force attacks
- Industry standard for password storage

### Why Layered Architecture?

```
HTTP Request → Route → Middleware → Controller → Service → Repository → Database
```

**Without layers** (bad approach):
```typescript
// Everything in one place - UNMAINTAINABLE
router.post('/users', async (req, res) => {
  // Validation logic
  // Password hashing
  // Database queries
  // JWT generation
  // Response formatting
  // Error handling
  // 200+ lines in one function
});
```

**With layers** (our approach):
- **Routes**: Just define URL → handler mapping
- **Middleware**: Reusable auth/validation across routes
- **Controllers**: HTTP in/out only, delegates to services
- **Services**: All business logic, database operations
- **Models**: Data structure definitions

This allows:
- Testing services without HTTP
- Reusing services in CLI tools or background jobs
- Team members working on different layers without conflicts

---

## Part 2: Person 1 - Authentication & User Management

### Overview

Person 1 built the foundation that all other features depend on:
- User registration and login
- JWT authentication system
- Email verification flow
- Password reset flow
- Role-based access control middleware

### Files Worked On

| Type | Files |
|------|-------|
| Models | `User.ts` |
| Services | `auth.service.ts`, `user.service.ts`, `email.service.ts` |
| Controllers | `auth.controller.ts`, `user.controller.ts` |
| Routes | `auth.routes.ts`, `user.routes.ts` |
| Middleware | `auth.middleware.ts`, `role.middleware.ts` |
| Utils | `jwt.ts`, `password.ts`, `tokens.ts` |

### Feature 1: User Registration

**Flow:**
```
POST /api/auth/register
    ↓
1. Validate email doesn't exist
2. Hash password with bcrypt
3. Generate email verification token
4. Save user to database
5. Send verification email
6. Return user (without password)
```

**Security Measures:**
- Password hashed before storage (never stored plain text)
- Email verification required for account activation
- Password never returned in responses

**Code Example:**
```typescript
export const registerUser = async (email, password, firstName, lastName, role) => {
  // Check for existing user
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) throw new Error('User with this email already exists');

  // SECURITY: Hash password before storage
  const hashedPassword = await hashPassword(password);

  // Generate verification token
  const emailVerificationToken = generateSecureToken();

  const user = userRepository.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role,
    emailVerificationToken,
  });

  await userRepository.save(user);
  await sendVerificationEmail(email, firstName, emailVerificationToken);

  // SECURITY: Never send password to client
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
```

### Feature 2: JWT Authentication

**How JWT Works in TSPark:**

1. **Login**: User provides email/password → Server validates → Returns JWT token
2. **Subsequent Requests**: Client sends token in `Authorization: Bearer <token>` header
3. **Server**: Middleware extracts and validates token → Sets `req.user` → Controller proceeds

**Token Payload:**
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;  // 'super_admin' | 'gym_owner' | 'client'
}
```

**Why JWT over Sessions:**
- Stateless: Server doesn't store session data
- Scalable: Works with multiple server instances
- Mobile-friendly: No cookies required

### Feature 3: Role-Based Access Control

**Three Roles:**
| Role | Permissions |
|------|-------------|
| `super_admin` | Everything (create exercises, approve gyms, manage all users) |
| `gym_owner` | Create gyms, create challenges for their gyms |
| `client` | Join challenges, log workouts, add friends |

**Middleware Chain Example:**
```typescript
// Only gym owners can create gyms
router.post('/gyms',
  authenticateToken,           // 1. Verify JWT is valid
  requireRole([UserRole.GYM_OWNER]),  // 2. Check user has correct role
  gymController.createGym      // 3. Execute if authorized
);
```

### Feature 4: Email Verification

**Why Email Verification:**
- Confirms user owns the email address
- Prevents spam registrations
- Required for password reset

**Flow:**
```
1. User registers → Token generated and saved
2. Email sent with link: /api/auth/verify-email?token=xxx
3. User clicks link → Token validated → emailVerified = true
```

### Feature 5: Password Reset

**Security Considerations:**
- Token expires after 1 hour
- Token is single-use (cleared after password change)
- Response doesn't reveal if email exists (prevents enumeration)

**Flow:**
```
1. POST /api/auth/forgot-password { email }
   → Always returns success (even if email doesn't exist)
   → If email exists: generate token, send email

2. POST /api/auth/reset-password { token, newPassword }
   → Validate token exists and not expired
   → Hash new password
   → Clear reset token
```

### API Endpoints (Person 1)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new user | No |
| POST | `/api/auth/login` | Get JWT token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| GET | `/api/auth/verify-email` | Verify email with token | No |
| POST | `/api/auth/resend-verification` | Resend verification email | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |

---

## Part 3: Person 2 - Gyms, Exercises & Challenges

### Overview

Person 2 built the core fitness platform features:
- Gym management with approval workflow
- Exercise library (admin-managed)
- Challenge system with participation tracking

### Files Worked On

| Type | Files |
|------|-------|
| Models | `Gym.ts`, `Exercise.ts`, `Challenge.ts`, `Participation.ts` |
| Services | `gym.service.ts`, `exercise.service.ts`, `challenge.service.ts` |
| Controllers | `gym.controller.ts`, `exercise.controller.ts`, `challenge.controller.ts` |
| Routes | `gym.routes.ts`, `exercise.routes.ts`, `challenge.routes.ts` |

### Feature 1: Gym Management

**Approval Workflow:**
```
1. Gym Owner creates gym → status = 'pending'
2. Super Admin reviews → approves/rejects
3. Only approved gyms visible to clients
```

**Why Approval System:**
- Quality control for platform
- Verify gym legitimacy before listing
- Prevent spam/fake gym listings

**Key Operations:**
```typescript
// Gym owner creates their gym
export const createGym = async (data, ownerId) => {
  const owner = await userRepository.findOne({ where: { id: ownerId } });
  if (!owner || owner.role !== UserRole.GYM_OWNER) {
    throw new Error('Only gym owners can create gyms');
  }

  const gym = gymRepository.create({
    ...data,
    ownerId,
    status: GymStatus.PENDING,  // Starts pending
  });

  return await gymRepository.save(gym);
};

// Super admin approves
export const approveGym = async (id, userId) => {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Only super administrators can approve gyms');
  }

  const gym = await gymRepository.findOne({ where: { id } });
  gym.status = GymStatus.APPROVED;
  return await gymRepository.save(gym);
};
```

### Feature 2: Exercise Library

**Super Admin Only**: Exercises are platform-wide resources. Only super admins can create/edit them to maintain quality.

**Exercise Properties:**
```typescript
@Entity('exercises')
export class Exercise {
  @Column()
  name: string;  // "Bench Press"

  @Column('simple-array')
  muscleGroups: string[];  // ['chest', 'triceps', 'shoulders']

  @Column({ type: 'enum', enum: ExerciseDifficulty })
  difficulty: ExerciseDifficulty;  // 'easy' | 'medium' | 'hard' | 'extreme'

  @Column('decimal')
  caloriesPerMinute: number;  // 8.5

  @Column({ nullable: true })
  videoUrl?: string;  // Tutorial video link
}
```

**Search & Filter:**
```typescript
export const getAllExercises = async (filters) => {
  const query = exerciseRepository.createQueryBuilder('exercise');

  if (filters.difficulty) {
    query.andWhere('exercise.difficulty = :difficulty', { difficulty: filters.difficulty });
  }

  if (filters.muscleGroup) {
    query.andWhere(':muscleGroup = ANY(exercise.muscleGroups)', { muscleGroup: filters.muscleGroup });
  }

  if (filters.search) {
    query.andWhere('(exercise.name ILIKE :search OR exercise.description ILIKE :search)', {
      search: `%${filters.search}%`,
    });
  }

  return await query.getMany();
};
```

### Feature 3: Challenge System

**Challenge Types:**
- `individual` - Solo challenges
- `team` - Group challenges
- `social` - Compete with friends

**Challenge Lifecycle:**
```
1. Created (by gym_owner or super_admin)
2. Active (between startDate and endDate)
3. Completed or Cancelled
```

**Participation Model** (Many-to-Many with extra data):
```typescript
// Why a separate Participation entity instead of just User ↔ Challenge ManyToMany?
// Because we need to track progress, status, and points for each user-challenge pair

@Entity('participations')
export class Participation {
  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Challenge)
  challenge: Challenge;

  @Column({ type: 'enum', enum: ParticipationStatus })
  status: ParticipationStatus;  // joined | in_progress | completed | abandoned

  @Column('jsonb')
  progress: ChallengeProgress;  // { currentWorkouts: 5, currentCalories: 500, ... }

  @Column({ default: 0 })
  pointsEarned: number;
}
```

**Join Challenge Flow:**
```typescript
export const joinChallenge = async (challengeId, userId) => {
  const challenge = await challengeRepository.findOne({ where: { id: challengeId } });

  // Validations
  if (challenge.status !== ChallengeStatus.ACTIVE) throw new Error('Challenge is not active');
  if (new Date() < challenge.startDate) throw new Error('Challenge has not started yet');
  if (new Date() > challenge.endDate) throw new Error('Challenge has already ended');

  // Check if user already joined
  const existingParticipation = await participationRepository.findOne({
    where: { userId, challengeId, status: In([ParticipationStatus.JOINED, ParticipationStatus.IN_PROGRESS]) }
  });
  if (existingParticipation) throw new Error('You have already joined this challenge');

  // Check max participants
  if (challenge.maxParticipants) {
    const currentParticipants = await participationRepository.count({ where: { challengeId, ... } });
    if (currentParticipants >= challenge.maxParticipants) {
      throw new Error('Challenge has reached maximum participants');
    }
  }

  // Create participation
  const participation = participationRepository.create({
    userId, challengeId,
    status: ParticipationStatus.JOINED,
    progress: { currentWorkouts: 0, currentCalories: 0, currentDuration: 0, completionPercentage: 0 },
    pointsEarned: 0,
  });

  return await participationRepository.save(participation);
};
```

### API Endpoints (Person 2)

**Gyms:**
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/gyms` | Create gym | Yes | gym_owner |
| GET | `/api/gyms` | List approved gyms | Yes | Any |
| GET | `/api/gyms/:id` | Get gym details | Yes | Any |
| PATCH | `/api/gyms/:id` | Update gym | Yes | owner/admin |
| PATCH | `/api/gyms/:id/approve` | Approve gym | Yes | super_admin |

**Exercises:**
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/exercises` | Create exercise | Yes | super_admin |
| GET | `/api/exercises` | List exercises | Yes | Any |
| GET | `/api/exercises/search` | Search exercises | Yes | Any |
| GET | `/api/exercises/:id` | Get exercise | Yes | Any |
| PATCH | `/api/exercises/:id` | Update exercise | Yes | super_admin |
| DELETE | `/api/exercises/:id` | Delete exercise | Yes | super_admin |

**Challenges:**
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/challenges` | Create challenge | Yes | gym_owner/admin |
| GET | `/api/challenges` | List challenges | Yes | Any |
| GET | `/api/challenges/:id` | Get challenge | Yes | Any |
| POST | `/api/challenges/:id/join` | Join challenge | Yes | client |
| POST | `/api/challenges/:id/leave` | Leave challenge | Yes | client |
| GET | `/api/challenges/:id/participants` | List participants | Yes | Any |

---

## Part 4: Person 3 - Workouts, Badges & Social

### Overview

Person 3 built the user engagement features:
- Workout logging and tracking
- Badge/achievement system
- Social features (friendships)

### Files Worked On

| Type | Files |
|------|-------|
| Models | `Workout.ts`, `Badge.ts`, `BadgeRule.ts`, `UserBadge.ts`, `Friendship.ts`, `Notification.ts` |
| Services | `workout.service.ts`, `badge.service.ts`, `social.service.ts` |
| Controllers | `workout.controller.ts`, `badge.controller.ts`, `social.controller.ts` |
| Routes | `workout.routes.ts`, `badge.routes.ts`, `social.routes.ts` |

### Feature 1: Workout Logging

**Purpose**: Users log their workout sessions to track progress in challenges.

**Workout Model:**
```typescript
@Entity('workouts')
export class Workout {
  @Column()
  name: string;  // "Morning Cardio"

  @Column()
  description: string;

  @Column()
  duration: number;  // minutes

  @Column()
  caloriesBurned: number;

  @ManyToOne(() => User, user => user.workouts)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
```

**Usage:**
```typescript
// Create a workout
const workout = await workoutService.createWorkout({
  name: "Morning Run",
  description: "5km jog around the park",
  duration: 30,
  caloriesBurned: 300,
  userId: currentUser.id
});

// Get user's workouts
const myWorkouts = await workoutService.getMyWorkouts(currentUser.id);
```

### Feature 2: Badge System

**Gamification**: Badges reward users for achievements, keeping them motivated.

**Badge Model:**
```typescript
@Entity('badges')
export class Badge {
  @Column()
  name: string;  // "Marathon Master"

  @Column()
  description: string;  // "Complete 10 challenges"

  @Column()
  icon: string;  // URL or emoji

  @Column()
  pointsValue: number;  // Points awarded with badge

  @Column({ default: true })
  isActive: boolean;  // Can be earned currently?
}
```

**UserBadge** (Junction table with extra data):
```typescript
@Entity('user_badges')
export class UserBadge {
  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Badge)
  badge: Badge;

  @CreateDateColumn()
  awardedAt: Date;  // When was it earned?
}
```

**Badge Assignment:**
```typescript
public async assignBadge(badgeAssignmentData: BadgeAssignment) {
  // Verify badge exists
  const badge = await badgeRepository.findOne({ where: { id: badgeAssignmentData.badgeId } });
  if (!badge) throw new Error('Badge not found');

  // Verify user exists
  const user = await userRepository.findOne({ where: { id: badgeAssignmentData.userId } });
  if (!user) throw new Error('User not found');

  // Create assignment
  const response = await UserBadgeRepository.save({
    badgeId: badgeAssignmentData.badgeId,
    userId: badgeAssignmentData.userId,
    awardedAt: new Date()
  });

  return response;
}
```

### Feature 3: Friendship System

**Why Friendships:**
- View friends' workout progress
- Invite friends to challenges
- Social motivation and accountability

**Friendship Model** (Self-referential):
```typescript
@Entity('friendships')
export class Friendship {
  @ManyToOne(() => User)
  requester: User;  // Who sent the request

  @ManyToOne(() => User)
  addressee: User;  // Who received it

  @Column({ type: 'enum', enum: FriendshipStatus })
  status: FriendshipStatus;  // pending | accepted | rejected

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  respondedAt?: Date;  // When accepted/rejected
}
```

**Friend Request Flow:**
```
1. User A sends request to User B → status = 'pending'
2. User B sees request in pending list
3. User B accepts/rejects
4. If accepted → both can see each other's data
```

**Key Operations:**

```typescript
// Send friend request
export const sendFriendRequest = async (requesterId, addresseeId) => {
  // Validation
  if (requesterId === addresseeId) throw new Error('Cannot send friend request to yourself');

  // Check for existing friendship
  const existingFriendship = await friendshipRepository
    .createQueryBuilder('friendship')
    .where('(requesterId = :requesterId AND addresseeId = :addresseeId)', { requesterId, addresseeId })
    .orWhere('(requesterId = :addresseeId AND addresseeId = :requesterId)', { requesterId, addresseeId })
    .getOne();

  if (existingFriendship) {
    if (existingFriendship.status === FriendshipStatus.ACCEPTED)
      throw new Error('Users are already friends');
    if (existingFriendship.status === FriendshipStatus.PENDING)
      throw new Error('Friend request already pending');
    // If rejected, allow re-sending
    if (existingFriendship.status === FriendshipStatus.REJECTED) {
      existingFriendship.status = FriendshipStatus.PENDING;
      existingFriendship.requesterId = requesterId;
      existingFriendship.addresseeId = addresseeId;
      return await friendshipRepository.save(existingFriendship);
    }
  }

  // Create new request
  const friendship = friendshipRepository.create({
    requesterId, addresseeId,
    status: FriendshipStatus.PENDING,
  });

  return await friendshipRepository.save(friendship);
};

// List friends (accepted only)
export const listFriends = async (userId) => {
  const friendships = await friendshipRepository
    .createQueryBuilder('friendship')
    .leftJoinAndSelect('friendship.requester', 'requester')
    .leftJoinAndSelect('friendship.addressee', 'addressee')
    .where('friendship.status = :status', { status: FriendshipStatus.ACCEPTED })
    .andWhere('(friendship.requesterId = :userId OR friendship.addresseeId = :userId)', { userId })
    .getMany();

  // Return the "other" user in each friendship
  return friendships.map(f => f.requesterId === userId ? f.addressee : f.requester);
};
```

### API Endpoints (Person 3)

**Workouts:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/workouts` | Log a workout | Yes |
| GET | `/api/workouts` | Get my workouts | Yes |
| GET | `/api/workouts/stats` | Get workout statistics | Yes |

**Badges:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/badges` | Create badge | Yes (admin) |
| GET | `/api/badges` | List all badges | Yes |
| GET | `/api/badges/my-badges` | Get my earned badges | Yes |
| POST | `/api/badges/assign` | Assign badge to user | Yes (admin) |

**Friends:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/friends` | List all friends | Yes |
| GET | `/api/friends/pending` | List pending requests received | Yes |
| GET | `/api/friends/sent` | List sent requests | Yes |
| GET | `/api/friends/status/:userId` | Get friendship status | Yes |
| POST | `/api/friends/request` | Send friend request | Yes |
| POST | `/api/friends/:id/accept` | Accept friend request | Yes |
| POST | `/api/friends/:id/reject` | Reject friend request | Yes |
| DELETE | `/api/friends/:id` | Remove friend | Yes |

---

## Part 5: Database Relationships Summary

```
User (1) ─────────┬──────── (N) Gym
                  │
                  ├──────── (N) Exercise (createdBy)
                  │
                  ├──────── (N) Workout
                  │
                  ├──────── (N) Participation
                  │                    │
                  │                    └──────── (1) Challenge
                  │                                    │
                  │                                    ├── recommendedExercises (N)
                  │                                    └── gym (1)
                  │
                  ├──────── (N) UserBadge ──────── (1) Badge
                  │
                  └──────── (N) Friendship ──────── (1) User (other)
```

---

## Part 6: Project Structure

```
src/
├── config/
│   ├── database.ts      # TypeORM connection setup
│   └── env.ts           # Environment variables
│
├── models/              # TypeORM entities
│   ├── User.ts
│   ├── Gym.ts
│   ├── Exercise.ts
│   ├── Challenge.ts
│   ├── Participation.ts
│   ├── Workout.ts
│   ├── Badge.ts
│   ├── BadgeRule.ts
│   ├── UserBadge.ts
│   ├── Friendship.ts
│   └── Notification.ts
│
├── services/            # Business logic
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── email.service.ts
│   ├── gym.service.ts
│   ├── exercise.service.ts
│   ├── challenge.service.ts
│   ├── workout.service.ts
│   ├── badge.service.ts
│   └── social.service.ts
│
├── controllers/         # HTTP request handlers
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── gym.controller.ts
│   ├── exercise.controller.ts
│   ├── challenge.controller.ts
│   ├── workout.controller.ts
│   ├── badge.controller.ts
│   └── social.controller.ts
│
├── routes/              # API route definitions
│   ├── index.ts         # Route aggregator
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── gym.routes.ts
│   ├── exercise.routes.ts
│   ├── challenge.routes.ts
│   ├── workout.routes.ts
│   ├── badge.routes.ts
│   └── social.routes.ts
│
├── middleware/          # Request processing
│   ├── auth.middleware.ts    # JWT verification
│   ├── role.middleware.ts    # Role checking
│   ├── validate.middleware.ts
│   └── error.middleware.ts
│
├── utils/               # Shared utilities
│   ├── jwt.ts           # Token generation/verification
│   ├── password.ts      # Bcrypt operations
│   ├── tokens.ts        # Secure token generation
│   ├── response.ts      # Response formatters
│   └── validator.ts
│
├── types/               # TypeScript types & enums
│   └── index.ts
│
├── app.ts               # Express app configuration
└── server.ts            # Server entry point
```

---

## Quick Demo Script

For live demonstration:

```bash
# 1. Start the server
docker-compose up

# 2. Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@test.com","password":"Demo123!","firstName":"Demo","lastName":"User"}'

# 3. Login and get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@test.com","password":"Demo123!"}' | jq -r '.data.token')

# 4. Get current user profile
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 5. List exercises
curl http://localhost:3000/api/exercises \
  -H "Authorization: Bearer $TOKEN"
```

---

## Questions to Prepare For

1. **Why not use MongoDB?** → Need relational integrity for complex relationships
2. **Why JWT over sessions?** → Stateless, scalable, mobile-friendly
3. **Why TypeORM?** → Type-safe, decorator-based, migration support
4. **Why separate services layer?** → Testability, reusability, separation of concerns
5. **How does password reset work securely?** → Time-limited tokens, hashed storage, email verification
