# TSPark - Fitness Challenge Platform API

A RESTful API for managing gyms, fitness challenges, workouts, badges, and social features. Built with TypeScript, Express 5, TypeORM, and PostgreSQL.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Getting Started with Docker](#getting-started-with-docker)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Available Commands](#available-commands)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing with Postman](#testing-with-postman)
- [User Roles & Permissions](#user-roles--permissions)
- [Feature Overview](#feature-overview)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)
- [Tech Stack](#tech-stack)

---

## Quick Start

```bash
git clone <repository-url>
cd ts-park
npm install                        # Install dependencies first
docker-compose up -d --build       # Start all services
docker-compose exec app npm run seed  # Seed database
```

**Access Points:**

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Adminer (DB UI)**: http://localhost:8080

---

## Getting Started with Docker

Docker is the recommended way to run TSPark.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Setup

```bash
# 1. Install dependencies first (required before Docker build)
npm install

# 2. Build and start all services
docker-compose up -d --build

# 3. Seed the database with test data
docker-compose exec app npm run seed
```

### Test Users (created by seed)

| Email | Password | Role |
|-------|----------|------|
| admin@tspark.com | SuperAdmin123! | Super Admin |
| gymowner@tspark.com | GymOwner123! | Gym Owner |
| client1@tspark.com | Client123! | Client |
| client2@tspark.com | Client123! | Client |

### Essential Docker Commands

```bash
docker-compose up -d --build     # Start services
docker-compose logs -f app       # View logs
docker-compose down              # Stop services
docker-compose down -v           # Stop and reset database
```

---

## Local Development Setup

If you prefer running without Docker:

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 16+ running locally
- npm or yarn

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your local PostgreSQL credentials
# Change DB_HOST from 'postgres' to 'localhost'
```

### Step 3: Setup Database

```bash
# Run migrations
npm run migration:run

# Seed initial data
npm run seed
```

### Step 4: Start Development Server

```bash
npm run dev
```

The API will start at http://localhost:3000 with hot-reload enabled.

---

## Environment Variables

Create a `.env` file with these variables:

```bash
# ===================
# Server Configuration
# ===================
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# ===================
# Database (PostgreSQL)
# ===================
DB_HOST=postgres          # Use 'localhost' for local dev
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=tspark_db

# ===================
# Authentication (JWT)
# ===================
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# ===================
# Super Admin (created on first run)
# ===================
SUPER_ADMIN_EMAIL=admin@tspark.com
SUPER_ADMIN_PASSWORD=SuperAdmin123!

# ===================
# Email (Optional in dev)
# ===================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@tspark.com

# ===================
# URLs
# ===================
FRONTEND_URL=http://localhost:3000
APP_URL=http://localhost:3000

# ===================
# Rate Limiting
# ===================
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Available Commands

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start development server with hot-reload |
| `npm run build`      | Compile TypeScript to JavaScript         |
| `npm run seed`       | Seed database with initial data          |
| `npm run migration:run` | Run pending migrations                |

**Inside Docker:** Prefix any command with `docker-compose exec app`

---

## Project Structure

```
ts-park/
├── docker/                    # Docker configuration files
│   ├── postgres/init.sql      # Database initialization
│   └── scripts/entrypoint.sh  # Container startup script
├── postman/                   # Postman API collection
│   └── tspark-api-collection.json
├── src/
│   ├── config/                # Database & app configuration
│   │   ├── database.ts        # TypeORM configuration
│   │   └── swagger.ts         # Swagger/OpenAPI setup
│   ├── controllers/           # HTTP request handlers
│   │   ├── auth.controller.ts
│   │   ├── badge.controller.ts
│   │   ├── challenge.controller.ts
│   │   ├── exercise.controller.ts
│   │   ├── gym.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── social.controller.ts
│   │   ├── user.controller.ts
│   │   └── workout.controller.ts
│   ├── database/              # Migrations and seeders
│   ├── dtos/                  # Data Transfer Objects (validation)
│   ├── middleware/            # Express middleware
│   │   ├── auth.middleware.ts # JWT authentication
│   │   ├── error.middleware.ts # Global error handling
│   │   └── validate.middleware.ts
│   ├── models/                # TypeORM entities
│   │   ├── Badge.ts
│   │   ├── BadgeRule.ts
│   │   ├── Challenge.ts
│   │   ├── Exercise.ts
│   │   ├── Friendship.ts
│   │   ├── Gym.ts
│   │   ├── Notification.ts
│   │   ├── Participation.ts
│   │   ├── User.ts
│   │   ├── UserBadge.ts
│   │   ├── Workout.ts
│   │   └── WorkoutExercice.ts
│   ├── routes/                # API route definitions
│   ├── services/              # Business logic layer
│   ├── types/                 # TypeScript types & enums
│   ├── utils/                 # Helper utilities
│   │   ├── jwt.ts
│   │   ├── tokens.ts
│   │   └── response.ts
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## API Documentation

### Interactive Documentation

**Swagger UI** is available at: http://localhost:3000/api/docs

### API Base URL

All API endpoints are prefixed with `/api`:

```
http://localhost:3000/api
```

### Endpoint Summary

#### Authentication (`/api/auth`)

| Method | Endpoint                       | Description            | Auth |
| ------ | ------------------------------ | ---------------------- | ---- |
| POST   | `/auth/register`               | Create new account     | No   |
| POST   | `/auth/login`                  | Get JWT token          | No   |
| GET    | `/auth/me`                     | Get current user       | Yes  |
| POST   | `/auth/logout`                 | Invalidate token       | Yes  |
| GET    | `/auth/verify-email?token=xxx` | Verify email           | No   |
| POST   | `/auth/resend-verification`    | Resend verification    | Yes  |
| POST   | `/auth/forgot-password`        | Request password reset | No   |
| POST   | `/auth/reset-password`         | Reset with token       | No   |

#### Users (`/api/users`) - Super Admin Only

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| GET    | `/users`           | List all users      |
| GET    | `/users/:id`       | Get user by ID      |
| GET    | `/users/:id/stats` | Get user statistics |
| PATCH  | `/users/:id/role`  | Update user role    |
| DELETE | `/users/:id`       | Deactivate user     |

#### Exercises (`/api/exercises`)

| Method | Endpoint                    | Description      | Role          |
| ------ | --------------------------- | ---------------- | ------------- |
| POST   | `/exercises`                | Create exercise  | Super Admin   |
| GET    | `/exercises`                | List exercises   | Authenticated |
| GET    | `/exercises/search?q=query` | Search exercises | Authenticated |
| GET    | `/exercises/:id`            | Get exercise     | Authenticated |
| PATCH  | `/exercises/:id`            | Update exercise  | Super Admin   |
| DELETE | `/exercises/:id`            | Soft-delete      | Super Admin   |
| GET    | `/exercises/deleted`        | List deleted     | Super Admin   |
| POST   | `/exercises/:id/restore`    | Restore deleted  | Super Admin   |

#### Gyms (`/api/gyms`)

| Method | Endpoint              | Description          | Role          |
| ------ | --------------------- | -------------------- | ------------- |
| POST   | `/gyms`               | Create gym (PENDING) | Gym Owner     |
| GET    | `/gyms`               | List gyms            | Authenticated |
| GET    | `/gyms/:id`           | Get gym details      | Authenticated |
| GET    | `/gyms/owner/:userId` | Get gyms by owner    | Authenticated |
| PATCH  | `/gyms/:id`           | Update gym           | Owner         |
| PATCH  | `/gyms/:id/approve`   | Approve gym          | Super Admin   |

#### Challenges (`/api/challenges`)

| Method | Endpoint                        | Description        | Role          |
| ------ | ------------------------------- | ------------------ | ------------- |
| POST   | `/challenges`                   | Create (DRAFT)     | Gym Owner     |
| GET    | `/challenges`                   | List challenges    | Authenticated |
| GET    | `/challenges/:id`               | Get challenge      | Authenticated |
| POST   | `/challenges/:id/start`         | Start challenge    | Creator       |
| POST   | `/challenges/:id/join`          | Join challenge     | Client        |
| POST   | `/challenges/:id/leave`         | Leave challenge    | Client        |
| GET    | `/challenges/my-participations` | My participations  | Client        |
| GET    | `/challenges/:id/participants`  | List participants  | Authenticated |
| PATCH  | `/challenges/:id`               | Update challenge   | Creator       |
| POST   | `/challenges/:id/complete`      | Complete challenge | Creator       |
| POST   | `/challenges/:id/cancel`        | Cancel challenge   | Creator       |
| DELETE | `/challenges/:id`               | Soft-delete        | Creator       |

#### Workouts (`/api/workouts`)

| Method | Endpoint               | Description         |
| ------ | ---------------------- | ------------------- |
| POST   | `/workouts`            | Log workout         |
| GET    | `/workouts`            | My workouts         |
| GET    | `/workouts/:id`        | Get workout details |
| GET    | `/workouts/statistics` | My statistics       |
| PATCH  | `/workouts/:id`        | Update workout      |
| DELETE | `/workouts/:id`        | Delete workout      |

#### Badges (`/api/badges`)

| Method | Endpoint            | Description       | Role          |
| ------ | ------------------- | ----------------- | ------------- |
| POST   | `/badges`           | Create badge      | Super Admin   |
| GET    | `/badges`           | My badges         | Authenticated |
| GET    | `/badges/available` | All active badges | Authenticated |
| GET    | `/badges/:id`       | Badge details     | Super Admin   |
| POST   | `/badges/:id/rules` | Create badge rule | Super Admin   |
| GET    | `/badges/:id/rules` | Get badge rules   | Super Admin   |
| POST   | `/badges/assign`    | Assign to user    | Super Admin   |
| DELETE | `/badges/rules/:id` | Delete rule       | Super Admin   |
| DELETE | `/badges/:id`       | Soft-delete badge | Super Admin   |

#### Friends (`/api/friends`)

| Method | Endpoint                  | Description       |
| ------ | ------------------------- | ----------------- |
| GET    | `/friends`                | List friends      |
| GET    | `/friends/pending`        | Pending requests  |
| GET    | `/friends/sent`           | Sent requests     |
| GET    | `/friends/status/:userId` | Friendship status |
| POST   | `/friends/request`        | Send request      |
| POST   | `/friends/:id/accept`     | Accept request    |
| POST   | `/friends/:id/reject`     | Reject request    |
| DELETE | `/friends/:id`            | Remove friend     |

#### Notifications (`/api/notifications`)

| Method | Endpoint                       | Description       |
| ------ | ------------------------------ | ----------------- |
| GET    | `/notifications`               | All notifications |
| GET    | `/notifications/unread-count`  | Unread count      |
| POST   | `/notifications/mark-all-read` | Mark all read     |

---

## Testing with Postman

The project includes a comprehensive Postman collection with pre-configured tests and automatic token management.

### Step 1: Import the Collection

1. Open Postman
2. Click **Import** button (top-left)
3. Select **File** tab
4. Navigate to: `postman/tspark-api-collection.json`
5. Click **Import**

### Step 2: Understand the Collection Structure

The collection is organized in sequential order for a complete test flow:

```
0. Health Check           → Verify API is running
1. Setup - Login Users    → Get JWT tokens for all users
2. Super Admin: Exercises → Create exercises (prereq for challenges)
3. Gym Owner: Create Gym  → Create gym (starts PENDING)
4. Super Admin: Approve   → Approve gym (PENDING → APPROVED)
5. Gym Owner: Challenges  → Create & start challenges
6. Client: Participate    → Join challenges, log workouts
7. Social & Badges        → Friend requests, badges
8. User Management        → Admin user operations
9. Auth Features          → Additional auth endpoints
99. Destructive Ops       → DELETE operations (run manually)
```

### Step 3: Complete Testing Flow

**Prerequisites:**

```bash
# Ensure services are running
docker-compose up -d

# Seed the database (creates test users)
docker-compose exec app npm run seed
```

**Run the Flow:**

1. **Health Check (Folder 0)**
   - Run `0.1 Health Check` to verify API is accessible

2. **Login All Users (Folder 1)**
   - Run all login requests (1.1 through 1.4)
   - Tokens are automatically saved to collection variables
   - Run `1.5 Verify Auth` to confirm tokens work

3. **Create Exercises (Folder 2)** - Super Admin
   - Run `2.1` and `2.2` to create exercises
   - Exercise IDs are auto-saved for later use

4. **Create Gym (Folder 3)** - Gym Owner
   - Run `3.1 Create Gym`
   - Note: Gym status is PENDING

5. **Approve Gym (Folder 4)** - Super Admin
   - Run `4.1 Approve Gym` (CRITICAL STEP!)
   - Status changes: PENDING → APPROVED

6. **Create Challenge (Folder 5)** - Gym Owner
   - Run `5.1 Create Challenge` (status: DRAFT)
   - Run `5.3 Start Challenge` (status: ACTIVE)
   - Now clients can join!

7. **Client Participation (Folder 6)**
   - Run `6.2 Join Challenge`
   - Run `6.4 Log Workout`
   - Run `6.7 Get Statistics`

8. **Social Features (Folder 7)**
   - Run friend request flow (7.1 → 7.4)
   - Create and assign badges

### Understanding Collection Variables

The collection uses variables that auto-update as you run requests:

| Variable          | Set By            | Used For              |
| ----------------- | ----------------- | --------------------- |
| `superAdminToken` | Login Super Admin | Authorization header  |
| `gymOwnerToken`   | Login Gym Owner   | Authorization header  |
| `clientToken`     | Login Client 1    | Authorization header  |
| `client2Token`    | Login Client 2    | Social testing        |
| `gymId`           | Create Gym        | Challenge creation    |
| `exerciseId`      | Create Exercise   | Workout logging       |
| `challengeId`     | Create Challenge  | Join/leave operations |
| `workoutId`       | Log Workout       | Update/delete         |
| `friendshipId`    | Friend Request    | Accept/reject         |
| `badgeId`         | Create Badge      | Badge operations      |

### Running Tests Automatically

You can run entire folders using Postman's Collection Runner:

1. Click the three dots next to a folder
2. Select **Run folder**
3. Review and click **Run**

---

## User Roles & Permissions

### Role Hierarchy

```
Super Admin (highest)
    └── Gym Owner
        └── Client (lowest)
```

### Super Admin

- Full platform access
- Create and manage exercises
- Approve/reject gym registrations
- Create and manage badges
- Manage all users
- View all data

### Gym Owner

- Create and manage their own gyms
- Create challenges for approved gyms
- View challenge participants and progress
- Cannot create exercises (Super Admin only)

### Client

- Browse gyms and challenges
- Join active challenges
- Log workouts
- Earn badges
- Social features (friends)

### Role Assignment

New users register as **Client** by default. Super Admin can promote users:

```bash
PATCH /api/users/:id/role
{
  "role": "gym_owner"  # or "super_admin"
}
```

---

## Feature Overview

### Authentication System

- JWT-based authentication
- Email verification flow
- Password reset via email
- Token blacklisting on logout
- Rate limiting protection

### Gym Management

- Gym creation with approval workflow
- Status: PENDING → APPROVED / REJECTED
- Equipment and specialization tracking
- Capacity management

### Challenge System

- Lifecycle: DRAFT → ACTIVE → COMPLETED / CANCELLED
- Individual or team challenges
- Difficulty levels and point rewards
- Progress tracking
- Recommended exercises

### Workout Tracking

- Log workouts with exercises
- Track duration, calories, sets, reps
- Automatic progress calculation
- Statistics and analytics

### Badge System

- Custom badges with icons
- Rule-based automatic awarding
- Manual badge assignment
- Point values for gamification

### Social Features

- Friend requests and connections
- Friendship status tracking
- Social notifications

---

## Database Management

### Adminer (Database UI)

Access at http://localhost:8080 with:
- **Server**: postgres | **Username**: postgres | **Password**: postgres | **Database**: tspark_db

### Entity Relationships

```text
User ─── owns ──→ Gym ──→ Challenge ──→ Participation
  │                            │
  ├── logs ──→ Workout         └── recommendedExercises ──→ Exercise
  ├── earns ──→ UserBadge ──→ Badge ──→ BadgeRule
  └── friends ──→ Friendship
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Containers not starting | `docker-compose logs -f` to check errors |
| Database connection errors | `docker-compose down -v` then restart |
| 401 Unauthorized | Token expired - login again |
| 403 Forbidden | Check your user role permissions |
| Gym cannot create challenges | Gym must be APPROVED by Super Admin first |
| Cannot join challenge | Challenge must be ACTIVE (not DRAFT) |

---

## Tech Stack

| Category             | Technology                       |
| -------------------- | -------------------------------- |
| **Runtime**          | Node.js 18+                      |
| **Language**         | TypeScript 5.x                   |
| **Framework**        | Express 5                        |
| **Database**         | PostgreSQL 16                    |
| **ORM**              | TypeORM 0.3                      |
| **Authentication**   | JWT (jsonwebtoken)               |
| **Password Hashing** | bcryptjs                         |
| **Validation**       | class-validator                  |
| **Email**            | Nodemailer                       |
| **Security**         | Helmet, CORS, express-rate-limit |
| **Documentation**    | Swagger/OpenAPI                  |
| **Containerization** | Docker & Docker Compose          |

---

## License

ISC

---

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run linting: `npm run lint`
4. Test with Postman collection
5. Submit a pull request

---

Made with TypeScript and Express by Ilia, Mohed and Wilson.
