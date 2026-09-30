-- Weigh-in saved on the bout (claude/updates/program-officer-friendly.md); the fighter's profile weight is
-- no longer overwritten. fighter_a/b_confirmed keep meaning "weighed in".
ALTER TABLE "matches" ADD COLUMN "weigh_in_a_kg" DECIMAL(5,2);
ALTER TABLE "matches" ADD COLUMN "weigh_in_b_kg" DECIMAL(5,2);
ALTER TABLE "matches" ADD COLUMN "weigh_in_at" TIMESTAMP(0);
ALTER TABLE "matches" ADD COLUMN "weigh_in_by" UUID;
