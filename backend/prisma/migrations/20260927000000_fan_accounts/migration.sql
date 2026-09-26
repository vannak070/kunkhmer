-- Fan accounts for the public site: accounts, sessions, followed fighters and
-- in-app notifications. Separate from staff users on purpose.
-- CreateTable
CREATE TABLE "fans" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "language" VARCHAR(5) NOT NULL DEFAULT 'en',
    "notify_email" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "fans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fan_sessions" (
    "id" UUID NOT NULL,
    "fan_id" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "last_used_at" TIMESTAMP(0),
    "expires_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "fan_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fan_follows" (
    "fan_id" UUID NOT NULL,
    "fighter_id" UUID NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "fan_follows_pkey" PRIMARY KEY ("fan_id","fighter_id")
);

-- CreateTable
CREATE TABLE "fan_notifications" (
    "id" UUID NOT NULL,
    "fan_id" UUID NOT NULL,
    "type" VARCHAR(40) NOT NULL,
    "fighter_id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "data" JSONB NOT NULL,
    "read_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "fan_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fans_email_key" ON "fans"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fan_sessions_token_hash_key" ON "fan_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "fan_sessions_fan_id_idx" ON "fan_sessions"("fan_id");

-- CreateIndex
CREATE INDEX "fan_sessions_expires_at_idx" ON "fan_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "fan_follows_fighter_id_idx" ON "fan_follows"("fighter_id");

-- CreateIndex
CREATE INDEX "fan_notifications_fan_id_created_at_idx" ON "fan_notifications"("fan_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "fan_notifications_fan_id_type_match_id_fighter_id_key" ON "fan_notifications"("fan_id", "type", "match_id", "fighter_id");

-- AddForeignKey
ALTER TABLE "fan_sessions" ADD CONSTRAINT "fan_sessions_fan_id_fkey" FOREIGN KEY ("fan_id") REFERENCES "fans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fan_follows" ADD CONSTRAINT "fan_follows_fan_id_fkey" FOREIGN KEY ("fan_id") REFERENCES "fans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fan_follows" ADD CONSTRAINT "fan_follows_fighter_id_fkey" FOREIGN KEY ("fighter_id") REFERENCES "fighters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fan_notifications" ADD CONSTRAINT "fan_notifications_fan_id_fkey" FOREIGN KEY ("fan_id") REFERENCES "fans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fan_notifications" ADD CONSTRAINT "fan_notifications_fighter_id_fkey" FOREIGN KEY ("fighter_id") REFERENCES "fighters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fan_notifications" ADD CONSTRAINT "fan_notifications_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

