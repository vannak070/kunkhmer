-- Program workflow phase 7 (claude/updates/match-signoff-settlement.md): sign-off, disputes, settlement checklist.
ALTER TABLE "events" ADD COLUMN "signed_off_at" TIMESTAMP(0), ADD COLUMN "signed_off_by" UUID;
ALTER TABLE "events" ADD CONSTRAINT "events_signed_off_by_foreign" FOREIGN KEY ("signed_off_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

CREATE TABLE "bout_disputes" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "raised_by_text" VARCHAR(255) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "resolution_note" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(0) NOT NULL,
    "resolved_by" UUID,
    "resolved_at" TIMESTAMP(0),

    CONSTRAINT "bout_disputes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "bout_disputes_event_id_status_index" ON "bout_disputes"("event_id", "status");
CREATE INDEX "bout_disputes_match_id_index" ON "bout_disputes"("match_id");
ALTER TABLE "bout_disputes" ADD CONSTRAINT "bout_disputes_match_id_foreign" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "bout_disputes" ADD CONSTRAINT "bout_disputes_event_id_foreign" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "bout_disputes" ADD CONSTRAINT "bout_disputes_created_by_foreign" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "bout_disputes" ADD CONSTRAINT "bout_disputes_resolved_by_foreign" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

CREATE TABLE "event_settlements" (
    "event_id" UUID NOT NULL,
    "party_kind" VARCHAR(20) NOT NULL,
    "party_id" UUID NOT NULL,
    "party_name" VARCHAR(255) NOT NULL,
    "settled_at" TIMESTAMP(0),
    "settled_by" UUID,
    "note" TEXT,

    CONSTRAINT "event_settlements_pkey" PRIMARY KEY ("event_id", "party_kind", "party_id")
);
ALTER TABLE "event_settlements" ADD CONSTRAINT "event_settlements_event_id_foreign" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "event_settlements" ADD CONSTRAINT "event_settlements_settled_by_foreign" FOREIGN KEY ("settled_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
