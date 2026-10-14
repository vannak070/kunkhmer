-- Empty corners ("to be announced" / "winner of bout N") and tournament draws. claude/updates/empty-corners-draws.md
ALTER TABLE "matches" ALTER COLUMN "fighter_a_id" DROP NOT NULL,
ALTER COLUMN "fighter_b_id" DROP NOT NULL,
ADD COLUMN "slot_a_from" UUID,
ADD COLUMN "slot_b_from" UUID,
ADD COLUMN "draw_id" UUID;
CREATE INDEX "matches_draw_id_index" ON "matches"("draw_id");
