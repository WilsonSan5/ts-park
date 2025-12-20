import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

/**
 * Swagger/OpenAPI Configuration
 * Generates interactive API documentation at /api/docs
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'TSPark API',
    version: '1.0.0',
    description: `
# TSPark - Fitness Challenge Platform API

A comprehensive API for managing fitness challenges, workouts, gyms, badges, and social features.

## Features
- **Authentication**: Register, login, email verification, password reset
- **Workouts**: Track workouts with exercises, statistics, and streaks
- **Challenges**: Create and join fitness challenges
- **Gyms**: Manage gym locations and memberships
- **Badges**: Earn achievements based on performance
- **Social**: Friend system with requests and connections
- **Notifications**: Real-time activity notifications

## Authentication
Most endpoints require a JWT Bearer token. Obtain one via \`POST /api/auth/login\`.

Click the **Authorize** button and enter: \`Bearer your_jwt_token_here\`
    `,
    contact: {
      name: 'TSPark Team',
      email: 'support@tspark.dev',
    },
    license: {
      name: 'ISC',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and authorization' },
    { name: 'Users', description: 'User management' },
    { name: 'Workouts', description: 'Workout tracking and statistics' },
    { name: 'Challenges', description: 'Fitness challenges' },
    { name: 'Gyms', description: 'Gym management' },
    { name: 'Exercises', description: 'Exercise library' },
    { name: 'Badges', description: 'Achievement badges' },
    { name: 'Social', description: 'Friends and social features' },
    { name: 'Notifications', description: 'User notifications' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from /api/auth/login',
      },
    },
    schemas: {
      // Common Response Schemas
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation successful' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message' },
          errors: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { type: 'object' } },
          total: { type: 'integer', example: 100 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          totalPages: { type: 'integer', example: 5 },
        },
      },

      // User Schemas
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
          email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          role: { type: 'string', enum: ['client', 'gym_owner', 'super_admin'], example: 'client' },
          status: { type: 'string', enum: ['active', 'inactive', 'suspended'], example: 'active' },
          emailVerified: { type: 'boolean', example: true },
          totalPoints: { type: 'integer', example: 1500 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // Auth Schemas
      RegisterDTO: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string', format: 'email', example: 'newuser@example.com' },
          password: { type: 'string', minLength: 8, example: 'SecurePass123!' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
        },
      },
      LoginDTO: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
          password: { type: 'string', example: 'SecurePass123!' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },

      // Workout Schemas
      WorkoutExercise: {
        type: 'object',
        required: ['exerciseId', 'sets', 'reps'],
        properties: {
          exerciseId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' },
          sets: { type: 'integer', minimum: 1, example: 3 },
          reps: { type: 'integer', minimum: 1, example: 12 },
          weight: { type: 'number', example: 20.5 },
          restTime: { type: 'integer', example: 60, description: 'Rest time in seconds' },
        },
      },
      CreateWorkoutDTO: {
        type: 'object',
        required: ['name', 'duration'],
        properties: {
          name: { type: 'string', example: 'Morning HIIT Session' },
          description: { type: 'string', example: 'High intensity interval training workout' },
          duration: { type: 'integer', minimum: 1, example: 45, description: 'Duration in minutes' },
          caloriesBurned: { type: 'integer', example: 400 },
          exercises: {
            type: 'array',
            items: { $ref: '#/components/schemas/WorkoutExercise' },
          },
        },
      },
      Workout: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Morning HIIT Session' },
          description: { type: 'string' },
          duration: { type: 'integer', example: 45 },
          caloriesBurned: { type: 'integer', example: 400 },
          userId: { type: 'string', format: 'uuid' },
          workoutExercises: {
            type: 'array',
            items: { $ref: '#/components/schemas/WorkoutExercise' },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      WorkoutStatistics: {
        type: 'object',
        properties: {
          totalWorkouts: { type: 'integer', example: 42 },
          totalDuration: { type: 'integer', example: 1890, description: 'Total duration in minutes' },
          totalCaloriesBurned: { type: 'integer', example: 15000 },
          workoutsThisWeek: { type: 'integer', example: 4 },
          workoutsThisMonth: { type: 'integer', example: 15 },
          averageDuration: { type: 'integer', example: 45 },
          averageCalories: { type: 'integer', example: 357 },
          currentStreak: { type: 'integer', example: 5, description: 'Consecutive days with workouts' },
          mostUsedExercises: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                exerciseId: { type: 'string', format: 'uuid' },
                name: { type: 'string', example: 'Push-ups' },
                count: { type: 'integer', example: 15 },
              },
            },
          },
        },
      },

      // Challenge Schemas
      CreateChallengeDTO: {
        type: 'object',
        required: ['title', 'description', 'startDate', 'endDate', 'type', 'difficulty'],
        properties: {
          title: { type: 'string', example: '30-Day Cardio Challenge' },
          description: { type: 'string', example: 'Complete 30 cardio workouts in 30 days' },
          startDate: { type: 'string', format: 'date', example: '2025-01-01' },
          endDate: { type: 'string', format: 'date', example: '2025-01-31' },
          type: { type: 'string', enum: ['individual', 'team', 'gym'], example: 'individual' },
          difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'intermediate' },
          gymId: { type: 'string', format: 'uuid' },
          isPublic: { type: 'boolean', example: true },
          maxParticipants: { type: 'integer', example: 100 },
          pointsReward: { type: 'integer', example: 500 },
          objectives: {
            type: 'object',
            properties: {
              totalWorkouts: { type: 'integer', example: 30 },
              totalCalories: { type: 'integer', example: 10000 },
              totalDuration: { type: 'integer', example: 900 },
            },
          },
        },
      },
      Challenge: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          type: { type: 'string', enum: ['individual', 'team', 'gym'] },
          difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          status: { type: 'string', enum: ['draft', 'active', 'completed', 'cancelled'] },
          isPublic: { type: 'boolean' },
          maxParticipants: { type: 'integer' },
          pointsReward: { type: 'integer' },
          participantCount: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // Gym Schemas
      CreateGymDTO: {
        type: 'object',
        required: ['name', 'address', 'city', 'country'],
        properties: {
          name: { type: 'string', example: 'FitZone Paris' },
          description: { type: 'string', example: 'Premium fitness center in the heart of Paris' },
          address: { type: 'string', example: '123 Avenue des Champs-Elysees' },
          city: { type: 'string', example: 'Paris' },
          country: { type: 'string', example: 'France' },
          postalCode: { type: 'string', example: '75008' },
          phone: { type: 'string', example: '+33 1 23 45 67 89' },
          email: { type: 'string', format: 'email', example: 'contact@fitzone-paris.com' },
          website: { type: 'string', format: 'uri', example: 'https://fitzone-paris.com' },
          specializedExerciseTypes: {
            type: 'array',
            items: { type: 'string' },
            example: ['cardio', 'strength', 'yoga'],
          },
        },
      },
      Gym: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          address: { type: 'string' },
          city: { type: 'string' },
          country: { type: 'string' },
          isApproved: { type: 'boolean' },
          ownerId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // Exercise Schemas
      CreateExerciseDTO: {
        type: 'object',
        required: ['name', 'description', 'muscleGroup', 'difficulty'],
        properties: {
          name: { type: 'string', example: 'Barbell Squat' },
          description: { type: 'string', example: 'A compound exercise targeting the quadriceps, hamstrings, and glutes' },
          muscleGroup: { type: 'string', enum: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full_body'], example: 'legs' },
          difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'intermediate' },
          equipmentRequired: { type: 'string', example: 'Barbell, Squat Rack' },
          instructions: { type: 'string', example: '1. Stand with feet shoulder-width apart...' },
          videoUrl: { type: 'string', format: 'uri', example: 'https://example.com/squat-tutorial' },
          caloriesPerMinute: { type: 'number', example: 8.5 },
        },
      },
      Exercise: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          muscleGroup: { type: 'string' },
          difficulty: { type: 'string' },
          equipmentRequired: { type: 'string' },
          instructions: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // Badge Schemas
      CreateBadgeDTO: {
        type: 'object',
        required: ['name', 'description', 'pointsValue'],
        properties: {
          name: { type: 'string', example: 'Workout Warrior' },
          description: { type: 'string', example: 'Awarded for completing 100 workouts' },
          icon: { type: 'string', example: 'trophy' },
          pointsValue: { type: 'integer', example: 100 },
          isActive: { type: 'boolean', example: true },
        },
      },
      Badge: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
          pointsValue: { type: 'integer' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      BadgeRule: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          badgeId: { type: 'string', format: 'uuid' },
          ruleType: { type: 'string', enum: ['challenges_completed', 'total_calories', 'total_workouts', 'total_points'] },
          operator: { type: 'string', enum: ['>=', '>', '=', '<', '<='] },
          targetValue: { type: 'integer' },
          description: { type: 'string' },
        },
      },
      CreateBadgeRuleDTO: {
        type: 'object',
        required: ['ruleType', 'operator', 'targetValue', 'description'],
        properties: {
          ruleType: { type: 'string', enum: ['challenges_completed', 'total_calories', 'total_workouts', 'total_points'], example: 'total_workouts' },
          operator: { type: 'string', enum: ['>=', '>', '=', '<', '<='], example: '>=' },
          targetValue: { type: 'integer', minimum: 1, example: 100 },
          description: { type: 'string', example: 'Complete at least 100 workouts' },
        },
      },

      // Social Schemas
      FriendRequestDTO: {
        type: 'object',
        required: ['addresseeId'],
        properties: {
          addresseeId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440002' },
        },
      },
      Friendship: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          requesterId: { type: 'string', format: 'uuid' },
          addresseeId: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['pending', 'accepted', 'rejected'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // Notification Schemas
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          type: { type: 'string', example: 'friend_request' },
          title: { type: 'string', example: 'New Friend Request' },
          message: { type: 'string', example: 'John Doe sent you a friend request' },
          isRead: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
