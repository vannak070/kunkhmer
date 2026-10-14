-- Shows (series) used as templates for new matches. claude/updates/show-templates-copy-week.md
CREATE TABLE "show_templates" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "broadcast_station_id" UUID,
    "main_sponsor_id" UUID,
    "location" VARCHAR(255),
    "start_time" VARCHAR(5),
    "weekday" INTEGER,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "show_templates_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "show_templates" ADD CONSTRAINT "show_templates_broadcast_station_id_fkey" FOREIGN KEY ("broadcast_station_id") REFERENCES "broadcast_stations"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "show_templates" ADD CONSTRAINT "show_templates_main_sponsor_id_fkey" FOREIGN KEY ("main_sponsor_id") REFERENCES "sponsors"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
