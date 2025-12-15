import 'reflect-metadata';
import { AppDataSource } from '../../config/database';
import { User } from '../../models/User';
import { hashPassword } from '../../utils/password';
import { UserRole, UserStatus } from '../../types';

/**
 * Database Seeder
 * Creates initial super admin and optional test data
 *
 * Usage: npm run seed
 *
 * Environment variables:
 * - SUPER_ADMIN_EMAIL (default: admin@tspark.com)
 * - SUPER_ADMIN_PASSWORD (default: SuperAdmin123!)
 */

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@tspark.com';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';

async function seedSuperAdmin(): Promise<void> {
  const userRepository = AppDataSource.getRepository(User);

  // Check if super admin already exists
  const existingAdmin = await userRepository.findOne({
    where: { email: SUPER_ADMIN_EMAIL }
  });

  if (existingAdmin) {
    console.log(`⚠️  Super Admin already exists: ${SUPER_ADMIN_EMAIL}`);
    return;
  }

  // Create super admin
  const hashedPassword = await hashPassword(SUPER_ADMIN_PASSWORD);

  const superAdmin = userRepository.create({
    email: SUPER_ADMIN_EMAIL,
    password: hashedPassword,
    firstName: 'Super',
    lastName: 'Admin',
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    emailVerified: true,
  });

  await userRepository.save(superAdmin);

  console.log('✅ Super Admin created successfully!');
  console.log(`   Email: ${SUPER_ADMIN_EMAIL}`);
  console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
  console.log('');
  console.log('⚠️  IMPORTANT: Change the password after first login!');
}

async function seedTestUsers(): Promise<void> {
  // Only seed test users if explicitly requested
  if (process.env.SEED_TEST_USERS !== 'true') {
    return;
  }

  const userRepository = AppDataSource.getRepository(User);

  const testUsers = [
    {
      email: 'gymowner@tspark.com',
      password: 'GymOwner123!',
      firstName: 'Gym',
      lastName: 'Owner',
      role: UserRole.GYM_OWNER,
    },
    {
      email: 'client@tspark.com',
      password: 'Client123!',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CLIENT,
    },
    {
      email: 'client2@tspark.com',
      password: 'Client123!',
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.CLIENT,
    },
  ];

  for (const userData of testUsers) {
    const existing = await userRepository.findOne({
      where: { email: userData.email }
    });

    if (existing) {
      console.log(`⚠️  Test user already exists: ${userData.email}`);
      continue;
    }

    const hashedPassword = await hashPassword(userData.password);

    const user = userRepository.create({
      ...userData,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    });

    await userRepository.save(user);
    console.log(`✅ Test user created: ${userData.email} (${userData.role})`);
  }
}

async function main(): Promise<void> {
  console.log('🌱 Starting database seeder...\n');

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    // Run seeders
    await seedSuperAdmin();
    await seedTestUsers();

    console.log('\n🎉 Seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

main();
