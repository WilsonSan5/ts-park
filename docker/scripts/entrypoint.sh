#!/bin/sh
set -e

echo "🚀 Starting TSPark Application..."

# Wait for database to be fully ready (healthcheck passes but TypeORM might need a moment)
echo "⏳ Waiting for database to be ready..."
sleep 3

# Run migrations
echo "📦 Running database migrations..."
npm run migration:run || echo "⚠️  Migrations may have already been applied"

# Run seeder (idempotent - safe to run multiple times)
echo "🌱 Running database seeder..."
npm run seed

# Start the application
echo "✅ Starting application server..."
exec npm run dev
