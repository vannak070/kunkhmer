-- Program workflow phase 6 (claude/updates/withdrawals-postponement.md): withdrawal / replacement / postponement / cancellation.
ALTER TABLE "matches" ADD COLUMN "replacement_side" VARCHAR(1);
ALTER TABLE "events" ADD COLUMN "original_date" DATE;

CREATE TABLE "match_changes" (
    "id" UUID NOT NULL,
    "seq" SERIAL NOT NULL,
    "event_id" UUID NOT NULL,
    "match_id" UUID,
    "kind" VARCHAR(20) NOT NULL,
    "side" VARCHAR(1),
    "fighter_id" UUID,
    "fighter_name" VARCHAR(255),
    "other_name" VARCHAR(255),
    "reason" VARCHAR(30),
    "note" TEXT,
    "from_date" DATE,
    "to_date" DATE,
    "marked_fighter" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID,
    "created_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "match_changes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "match_changes_event_id_seq_index" ON "match_changes"("event_id", "seq");

ALTER TABLE "match_changes" ADD CONSTRAINT "match_changes_event_id_foreign" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "match_changes" ADD CONSTRAINT "match_changes_created_by_foreign" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
