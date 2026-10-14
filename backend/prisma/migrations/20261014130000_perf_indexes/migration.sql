-- Admin performance (claude/updates/admin-performance.md): indexes for the lookups the admin and the KKF rules run on every request.
CREATE INDEX "matches_event_id_index" ON "matches"("event_id");
CREATE INDEX "matches_sub_event_id_index" ON "matches"("sub_event_id");
CREATE INDEX "matches_fighter_a_id_index" ON "matches"("fighter_a_id");
CREATE INDEX "matches_fighter_b_id_index" ON "matches"("fighter_b_id");
CREATE INDEX "sub_events_event_id_index" ON "sub_events"("event_id");
CREATE INDEX "sub_events_date_index" ON "sub_events"("date");
CREATE INDEX "events_date_index" ON "events"("date");
CREATE INDEX "events_broadcast_station_id_index" ON "events"("broadcast_station_id");
CREATE INDEX "fighters_club_id_index" ON "fighters"("club_id");
