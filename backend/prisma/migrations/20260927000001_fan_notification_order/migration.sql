-- created_at has whole-second precision, so notifications created in the same
-- second were listed in arbitrary order. seq records insertion order as a
-- tie-breaker for "newest first".
ALTER TABLE "fan_notifications" ADD COLUMN "seq" BIGSERIAL NOT NULL;

DROP INDEX "fan_notifications_fan_id_created_at_idx";
CREATE INDEX "fan_notifications_fan_id_created_at_seq_idx" ON "fan_notifications"("fan_id", "created_at", "seq");
