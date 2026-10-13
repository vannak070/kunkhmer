-- Program workflow phase 4 (claude/updates/offline-agreements-log.md): fight night licence + offline agreements log.
ALTER TABLE "events" ADD COLUMN "licence_number" VARCHAR(100),
ADD COLUMN "licence_date" DATE,
ADD COLUMN "licence_document" VARCHAR(255);

CREATE TABLE "event_agreements" (
    "id" UUID NOT NULL,
    "seq" SERIAL NOT NULL,
    "event_id" UUID NOT NULL,
    "item" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "note" TEXT,
    "snapshot" JSONB NOT NULL,
    "recorded_by" UUID,
    "recorded_at" TIMESTAMP(0) NOT NULL,
    "confirmed_by" UUID,
    "confirmed_at" TIMESTAMP(0),
    "kkf_comment" TEXT,

    CONSTRAINT "event_agreements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "event_agreements_event_id_item_index" ON "event_agreements"("event_id", "item");
CREATE INDEX "event_agreements_status_index" ON "event_agreements"("status");

ALTER TABLE "event_agreements" ADD CONSTRAINT "event_agreements_event_id_foreign" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "event_agreements" ADD CONSTRAINT "event_agreements_recorded_by_foreign" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "event_agreements" ADD CONSTRAINT "event_agreements_confirmed_by_foreign" FOREIGN KEY ("confirmed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
