-- ===================================
-- TSPark Database Initialization Script
-- ===================================
-- This script runs automatically when the PostgreSQL container is first created
-- It sets up the database with necessary extensions and initial configuration

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto extension for cryptographic functions (optional but useful)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'TSPark database initialized successfully!';
    RAISE NOTICE 'UUID extension: enabled';
    RAISE NOTICE 'Database: tspark_db';
    RAISE NOTICE 'Ready for TypeORM synchronization';
END $$;

-- Create a simple health check function
CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE (
    status TEXT,
    database_name TEXT,
    connection_count INTEGER,
    checked_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        'healthy'::TEXT,
        current_database()::TEXT,
        (SELECT count(*)::INTEGER FROM pg_stat_activity WHERE datname = current_database()),
        now()::TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Log completion
SELECT 'Database initialization complete!' AS status;
