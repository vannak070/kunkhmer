-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255) NOT NULL DEFAULT 'Viewer/Fan',
    "status" VARCHAR(255) NOT NULL DEFAULT 'Active',
    "club_id" UUID,
    "last_login" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_access_tokens" (
    "id" BIGSERIAL NOT NULL,
    "tokenable_type" VARCHAR(255) NOT NULL,
    "tokenable_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "abilities" TEXT,
    "last_used_at" TIMESTAMP(0),
    "expires_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "personal_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_khmer" VARCHAR(255),
    "location" VARCHAR(255),
    "head_coach" VARCHAR(255),
    "status" VARCHAR(255) NOT NULL DEFAULT 'active',
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 4,
    "image" TEXT,
    "phone" VARCHAR(255),
    "email" VARCHAR(255),
    "established" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fighters" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_khmer" VARCHAR(255) NOT NULL,
    "alias" VARCHAR(255),
    "date_of_birth" DATE NOT NULL,
    "nationality" VARCHAR(255) NOT NULL DEFAULT 'Cambodian',
    "province" VARCHAR(255),
    "gender" VARCHAR(10) NOT NULL,
    "current_weight" DECIMAL(5,2) NOT NULL,
    "height" DECIMAL(5,2) NOT NULL,
    "club_id" UUID,
    "image" TEXT,
    "style" VARCHAR(255),
    "record" VARCHAR(50),
    "grade" VARCHAR(5) NOT NULL DEFAULT 'D',
    "status" VARCHAR(50) NOT NULL DEFAULT 'Draft',
    "professional_status" VARCHAR(50) NOT NULL DEFAULT 'Professional',
    "verified_by" UUID,
    "verified_date" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "deleted_at" TIMESTAMP(0),
    "medical_status" VARCHAR(255) NOT NULL DEFAULT 'Cleared',
    "suspension_end_date" DATE,

    CONSTRAINT "fighters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broadcast_stations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "stream_url" TEXT,
    "type" VARCHAR(255) NOT NULL DEFAULT 'Cable TV',
    "reach" VARCHAR(255) NOT NULL DEFAULT 'National',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "contact_person" VARCHAR(255),
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(255),
    "website_url" TEXT,
    "logo_url" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "broadcast_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsors" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "logo_url" TEXT,
    "image" TEXT,
    "industry" VARCHAR(255),
    "tier" VARCHAR(255) NOT NULL DEFAULT 'Gold',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "contact_person" VARCHAR(255),
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(255),
    "website_url" TEXT,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "end_date" DATE,
    "location" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255) NOT NULL DEFAULT 'Draft',
    "organizer_id" UUID NOT NULL,
    "broadcast_station_id" UUID,
    "main_sponsor_id" UUID,
    "description" TEXT,
    "image" TEXT,
    "kkf_approval_date" TIMESTAMP(0),
    "kkf_approved_by" UUID,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "event_type" VARCHAR(255) NOT NULL DEFAULT 'single-day',
    "is_tournament" BOOLEAN NOT NULL DEFAULT false,
    "tournament_format" VARCHAR(255),
    "tournament_weight_class" VARCHAR(255),
    "expected_participants" INTEGER NOT NULL DEFAULT 8,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_sponsors" (
    "event_id" UUID NOT NULL,
    "sponsor_id" UUID NOT NULL,

    CONSTRAINT "event_sponsors_pkey" PRIMARY KEY ("event_id","sponsor_id")
);

-- CreateTable
CREATE TABLE "sub_events" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "week_number" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "phase" VARCHAR(255) NOT NULL DEFAULT 'Qualifier',
    "status" VARCHAR(255) NOT NULL DEFAULT 'Scheduled',
    "batch_number" VARCHAR(255),
    "created_by" UUID,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "sub_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "sub_event_id" UUID NOT NULL,
    "fighter_a_id" UUID NOT NULL,
    "fighter_b_id" UUID NOT NULL,
    "rounds" INTEGER NOT NULL,
    "round_time" INTEGER NOT NULL,
    "knockdown_limit" INTEGER NOT NULL,
    "agreed_weight" DECIMAL(5,2) NOT NULL,
    "glove_size" VARCHAR(10) NOT NULL,
    "glove_brand" VARCHAR(255) NOT NULL,
    "fighter_a_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "fighter_b_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "referee_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "glove_confirmed_date" TIMESTAMP(0),
    "status" VARCHAR(255) NOT NULL DEFAULT 'Draft',
    "proposal_status" VARCHAR(255) NOT NULL DEFAULT 'draft',
    "club_a_response" VARCHAR(255) NOT NULL DEFAULT 'pending',
    "club_b_response" VARCHAR(255) NOT NULL DEFAULT 'pending',
    "referee_id" UUID,
    "judge_ids" JSON,
    "winner_id" UUID,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "is_title_match" BOOLEAN NOT NULL DEFAULT false,
    "championship_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bout_results" (
    "match_id" UUID NOT NULL,
    "winner_id" UUID,
    "method" VARCHAR(255) NOT NULL,
    "round" INTEGER NOT NULL,
    "duration" VARCHAR(255),
    "recorded_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bout_results_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "champions" (
    "id" UUID NOT NULL,
    "title_name" VARCHAR(255) NOT NULL,
    "champion_type" VARCHAR(255) NOT NULL,
    "weight_class" DECIMAL(5,2) NOT NULL,
    "organization" VARCHAR(255) NOT NULL DEFAULT 'KKF',
    "batch_id" VARCHAR(255),
    "event_name" VARCHAR(255),
    "current_holder_id" UUID,
    "current_holder_name" VARCHAR(255),
    "nationality" VARCHAR(255),
    "date_created" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_awarded" TIMESTAMP(0),
    "winning_match_id" UUID,
    "status" VARCHAR(255) NOT NULL DEFAULT 'Vacant',
    "defense_count" INTEGER NOT NULL DEFAULT 0,
    "last_defense_date" DATE,
    "next_defense_deadline" DATE,
    "belt_image_url" TEXT,
    "trophy_image_url" TEXT,
    "certificate_url" TEXT,
    "notes" TEXT,
    "approval_status" VARCHAR(255) NOT NULL DEFAULT 'approved',
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "champions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "champion_defenses" (
    "id" UUID NOT NULL,
    "champion_id" UUID NOT NULL,
    "event_id" UUID,
    "event_name" VARCHAR(255) NOT NULL,
    "match_id" UUID,
    "date" DATE NOT NULL,
    "opponent" VARCHAR(255) NOT NULL,
    "opponent_id" UUID,
    "result" VARCHAR(255) NOT NULL,
    "method" VARCHAR(255),
    "round" INTEGER,

    CONSTRAINT "champion_defenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(255),
    "content" TEXT,
    "author" VARCHAR(255),
    "publish_date" DATE,
    "status" VARCHAR(255) NOT NULL DEFAULT 'Draft',
    "category" VARCHAR(255) NOT NULL DEFAULT 'General',
    "featured_image" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "tags" JSON,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "youtube_url" VARCHAR(255),
    "duration" VARCHAR(255),
    "category" VARCHAR(255) NOT NULL DEFAULT 'General',
    "status" VARCHAR(255) NOT NULL DEFAULT 'Draft',
    "tags" JSON,
    "fighter_id" UUID,
    "club_id" UUID,
    "match_id" UUID,
    "thumbnail" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "deleted_at" TIMESTAMP(0),

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_unique" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "personal_access_tokens_token_unique" ON "personal_access_tokens"("token");

-- CreateIndex
CREATE INDEX "personal_access_tokens_expires_at_index" ON "personal_access_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_index" ON "personal_access_tokens"("tokenable_type", "tokenable_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_club_id_foreign" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "fighters" ADD CONSTRAINT "fighters_club_id_foreign" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "fighters" ADD CONSTRAINT "fighters_verified_by_foreign" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_foreign" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_kkf_approved_by_foreign" FOREIGN KEY ("kkf_approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_broadcast_station_id_foreign" FOREIGN KEY ("broadcast_station_id") REFERENCES "broadcast_stations"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_main_sponsor_id_foreign" FOREIGN KEY ("main_sponsor_id") REFERENCES "sponsors"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event_sponsors" ADD CONSTRAINT "event_sponsors_event_id_foreign" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event_sponsors" ADD CONSTRAINT "event_sponsors_sponsor_id_foreign" FOREIGN KEY ("sponsor_id") REFERENCES "sponsors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sub_events" ADD CONSTRAINT "sub_events_event_id_foreign" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sub_events" ADD CONSTRAINT "sub_events_created_by_foreign" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_event_id_foreign" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_sub_event_id_foreign" FOREIGN KEY ("sub_event_id") REFERENCES "sub_events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_fighter_a_id_foreign" FOREIGN KEY ("fighter_a_id") REFERENCES "fighters"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_fighter_b_id_foreign" FOREIGN KEY ("fighter_b_id") REFERENCES "fighters"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_referee_id_foreign" FOREIGN KEY ("referee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_id_foreign" FOREIGN KEY ("winner_id") REFERENCES "fighters"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_championship_id_foreign" FOREIGN KEY ("championship_id") REFERENCES "champions"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bout_results" ADD CONSTRAINT "bout_results_match_id_foreign" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bout_results" ADD CONSTRAINT "bout_results_winner_id_foreign" FOREIGN KEY ("winner_id") REFERENCES "fighters"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "champions" ADD CONSTRAINT "champions_current_holder_id_foreign" FOREIGN KEY ("current_holder_id") REFERENCES "fighters"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "champions" ADD CONSTRAINT "champions_winning_match_id_foreign" FOREIGN KEY ("winning_match_id") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "champion_defenses" ADD CONSTRAINT "champion_defenses_champion_id_foreign" FOREIGN KEY ("champion_id") REFERENCES "champions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "champion_defenses" ADD CONSTRAINT "champion_defenses_event_id_foreign" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "champion_defenses" ADD CONSTRAINT "champion_defenses_match_id_foreign" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "champion_defenses" ADD CONSTRAINT "champion_defenses_opponent_id_foreign" FOREIGN KEY ("opponent_id") REFERENCES "fighters"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_fighter_id_foreign" FOREIGN KEY ("fighter_id") REFERENCES "fighters"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_club_id_foreign" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_match_id_foreign" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
