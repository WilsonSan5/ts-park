# TSPark - Fitness Challenge Platform API

A RESTful API for managing gyms, fitness challenges, workouts, and social features. Built with TypeScript, Express, TypeORM, and PostgreSQL.

## Quick Start

### Using Docker (Recommended)
```bash
docker-compose up
```
- API: http://localhost:3000
- Adminer (DB UI): http://localhost:8080

### Local Development
```bash
npm install
cp .env.example .env  # Configure your database
npm run dev
```

## Environment Variables

```bash
# Database
DB_HOST=postgres          # 'localhost' for local dev
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=tspark_db

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Server
NODE_ENV=development
PORT=3000
```

## Features

### Authentication & Users
- JWT-based authentication with email verification
- Password reset via email
- Role-based access control (super_admin, gym_owner, client)

### Gyms & Challenges
- Gym owners create and manage gyms (pending admin approval)
- Create fitness challenges with recommended exercises
- Track participant progress and award points

### Workouts & Progress
- Log workouts linked to challenge participation
- Track calories, duration, and exercise completion
- Automatic progress calculation

### Badges & Gamification
- Create badges with custom award rules
- Automatic badge assignment based on achievements
- Points system for motivation

### Social
- Friend requests and connections
- View friends' progress and achievements

## API Endpoints

| Resource | Endpoints |
|----------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Users | `GET /api/users`, `PATCH /api/users/:id` |
| Gyms | `POST /api/gyms`, `GET /api/gyms`, `PATCH /api/gyms/:id/approve` |
| Exercises | `POST /api/exercises`, `GET /api/exercises` |
| Challenges | `POST /api/challenges`, `POST /api/challenges/:id/join` |
| Workouts | `POST /api/workouts`, `GET /api/workouts/stats` |
| Badges | `POST /api/badges`, `GET /api/badges/my-badges` |
| Friends | `POST /api/friends/request`, `POST /api/friends/:id/accept` |

## Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Run ESLint
npm run format           # Format with Prettier

# Database
npm run migration:generate -- src/migrations/Name
npm run migration:run
npm run seed
```

## Project Structure

```
src/
├── config/        # Database and environment config
├── controllers/   # HTTP request handlers
├── middleware/    # Auth, roles, validation
├── models/        # TypeORM entities
├── routes/        # API route definitions
├── services/      # Business logic
├── types/         # TypeScript types and enums
└── utils/         # JWT, password, response helpers
```

## Testing

Import the Postman collection from `postman/` directory for API testing.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5
- **Database**: PostgreSQL + TypeORM
- **Auth**: JWT + bcrypt
- **Security**: Helmet, CORS, rate limiting
- **Email**: Nodemailer
