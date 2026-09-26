-- Tables only the Laravel backend used (framework cache, queue, web sessions,
-- migration history). Databases created by Prisma never had them.
DROP TABLE IF EXISTS "cache";
DROP TABLE IF EXISTS "cache_locks";
DROP TABLE IF EXISTS "failed_jobs";
DROP TABLE IF EXISTS "job_batches";
DROP TABLE IF EXISTS "jobs";
DROP TABLE IF EXISTS "migrations";
DROP TABLE IF EXISTS "sessions";
