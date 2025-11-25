import { DataSource } from 'typeorm';
import { config } from './env';

// Import all models
import { User } from '../models/User';
import { Gym } from '../models/Gym';
import { Exercise } from '../models/Exercise';
import { Challenge } from '../models/Challenge';
import { Participation } from '../models/Participation';
import { Workout } from '../models/Workout';
import { Badge } from '../models/Badge';
import { BadgeRule } from '../models/BadgeRule';
import { UserBadge } from '../models/UserBadge';
import { Friendship } from '../models/Friendship';
import { Notification } from '../models/Notification';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.nodeEnv === 'development', // Auto-create tables in development
  logging: config.nodeEnv === 'development',
  entities: [
    User,
    Gym,
    Exercise,
    Challenge,
    Participation,
    Workout,
    Badge,
    BadgeRule,
    UserBadge,
    Friendship,
    Notification,
  ],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
