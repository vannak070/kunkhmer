-- Program workflow phase 5 (claude/updates/fight-night-titles.md): the belts a fight night puts on the line.
CREATE TABLE "event_titles" (
    "event_id" UUID NOT NULL,
    "champion_id" UUID NOT NULL,

    CONSTRAINT "event_titles_pkey" PRIMARY KEY ("event_id","champion_id")
);

CREATE INDEX "event_titles_champion_id_index" ON "event_titles"("champion_id");

ALTER TABLE "event_titles" ADD CONSTRAINT "event_titles_event_id_foreign" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "event_titles" ADD CONSTRAINT "event_titles_champion_id_foreign" FOREIGN KEY ("champion_id") REFERENCES "champions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
