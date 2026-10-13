-- Program workflow phase 3 (claude/updates/broadcaster-organizer-accounts.md): an Organizer account belongs to one
-- broadcaster (broadcast station); several accounts per broadcaster. Cleared if the station is deleted.
ALTER TABLE "users" ADD COLUMN "broadcast_station_id" UUID;
CREATE INDEX "users_broadcast_station_id_index" ON "users"("broadcast_station_id");
ALTER TABLE "users" ADD CONSTRAINT "users_broadcast_station_id_foreign" FOREIGN KEY ("broadcast_station_id") REFERENCES "broadcast_stations"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
