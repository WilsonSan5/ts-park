# TSPark - Fitness Challenge Platform API

A backend API for a fitness challenge platform built with Node.js, TypeScript, and PostgreSQL.

## 🚀 Quick Start

### 🐳 **Option 1: Docker (Recommended)**

**Prerequisites:** Docker Desktop installed

```bash
# Start everything with one command
docker-compose up

# That's it! API runs at http://localhost:3000
```

**Benefits:**
- ✅ No PostgreSQL installation needed
- ✅ No environment configuration
- ✅ Works identically for all team members
- ✅ Professional development setup

👉 **See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for complete Docker guide**

---

### 💻 **Option 2: Manual Setup**

**Prerequisites:**
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

**Installation:**

1. **Clone and install dependencies**
```bash
npm install
```

2. **Setup database**
```bash
# Create PostgreSQL database
createdb tspark_db

# Or using psql
psql -U postgres
CREATE DATABASE tspark_db;
```

3. **Configure environment**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
```

4. **Start development server**
```bash
npm run dev
```

Server will start on `http://localhost:3000`

## 📁 Project Structure

```
src/
├── config/         # Configuration files (database, environment)
├── models/         # Database models (TypeORM entities)
├── controllers/    # Request handlers
├── services/       # Business logic
├── routes/         # API routes
├── middleware/     # Express middleware
├── utils/          # Helper functions
└── types/          # TypeScript types and interfaces
```

## 🛠️ Available Scripts

### With Docker
```bash
docker-compose up              # Start all services
docker-compose down            # Stop all services
docker-compose logs -f app     # View logs
docker-compose exec app sh     # Access container shell
docker-compose exec app npm run migration:run  # Run migrations
```

### Without Docker
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

#### Users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/profile` - Update profile

#### Gyms
- `POST /api/gyms` - Create gym (gym owner)
- `GET /api/gyms` - List approved gyms
- `GET /api/gyms/:id` - Get gym details
- `PATCH /api/gyms/:id` - Update gym
- `PATCH /api/gyms/:id/approve` - Approve gym (admin)

#### Challenges
- `POST /api/challenges` - Create challenge
- `GET /api/challenges` - List challenges
- `GET /api/challenges/:id` - Get challenge details
- `POST /api/challenges/:id/join` - Join challenge
- `POST /api/challenges/:id/leave` - Leave challenge

#### Workouts
- `POST /api/workouts` - Log workout
- `GET /api/workouts` - Get user workouts
- `GET /api/workouts/stats` - Get workout statistics

#### Badges
- `POST /api/badges` - Create badge (admin)
- `GET /api/badges` - List all badges
- `GET /api/badges/my-badges` - Get user's badges

#### Social
- `POST /api/social/friends/request/:userId` - Send friend request
- `PATCH /api/social/friends/:requestId/accept` - Accept friend request
- `GET /api/social/friends` - Get friends list

## 🗄️ Database Models

### User
- id, email, password, firstName, lastName
- role (super_admin, gym_owner, client)
- status (pending, active, suspended)
- totalPoints

### Gym
- id, name, description, address, city
- capacity, equipment
- status (pending, approved, rejected)
- ownerId → User

### Challenge
- id, title, description, type, difficulty
- objectives (targetDuration, targetCalories, targetWorkouts)
- startDate, endDate, pointsReward
- creatorId → User, gymId → Gym

### Participation
- id, status, progress
- userId → User, challengeId → Challenge

### Workout
- id, date, duration, caloriesBurned
- userId → User, participationId → Participation

### Badge
- id, name, description, icon, pointsValue

### Friendship
- id, status (pending, accepted, rejected)
- requesterId → User, addresseeId → User

## 🧑‍💻 Team Collaboration

### Person 1 - Authentication & Users
- Models: `User.ts`
- Controllers: `auth.controller.ts`, `user.controller.ts`
- Services: `auth.service.ts`, `user.service.ts`
- Routes: `auth.routes.ts`, `user.routes.ts`
- Middleware: `auth.middleware.ts`, `role.middleware.ts`

### Person 2 - Gyms & Challenges
- Models: `Gym.ts`, `Challenge.ts`, `Participation.ts`
- Controllers: `gym.controller.ts`, `challenge.controller.ts`
- Services: `gym.service.ts`, `challenge.service.ts`
- Routes: `gym.routes.ts`, `challenge.routes.ts`

### Person 3 - Workouts, Badges & Social
- Models: `Workout.ts`, `Badge.ts`, `BadgeRule.ts`, `UserBadge.ts`, `Friendship.ts`
- Controllers: `workout.controller.ts`, `badge.controller.ts`, `social.controller.ts`
- Services: `workout.service.ts`, `badge.service.ts`, `social.service.ts`
- Routes: `workout.routes.ts`, `badge.routes.ts`, `social.routes.ts`

## 📝 Development Workflow

1. **Create a feature branch**
```bash
git checkout -b feature/user-authentication
```

2. **Implement your feature**
- Start with the model
- Create the service (business logic)
- Create the controller (request handling)
- Add routes
- Test with Postman

3. **Test your endpoints**
```bash
# Use Postman or curl
curl http://localhost:3000/health
```

4. **Commit and push**
```bash
git add .
git commit -m "feat: implement user authentication"
git push origin feature/user-authentication
```

## 🧪 Testing with Postman

1. Create a Postman collection named "TSPark API"
2. Add environment variables:
   - `base_url`: http://localhost:3000/api
   - `token`: (will be set after login)
3. Test each endpoint as you build it

## ⚙️ Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=tspark_db

# JWT
JWT_SECRET=your-super-secret-key

# Email (optional for now)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 📖 Learning Resources

- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

## 🆘 Troubleshooting

### Database connection failed
- Check if PostgreSQL is running: `pg_isready`
- Verify database credentials in `.env`
- Ensure database exists: `psql -l`

### Port already in use
- Change PORT in `.env` file
- Or kill the process: `lsof -ti:3000 | xargs kill -9`

### TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- Check `tsconfig.json` configuration

## 📞 Support

For questions or issues, contact your team members or instructor.

---

**Happy Coding! 🚀**
