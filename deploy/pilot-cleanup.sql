-- Pilot clean-up (owner decisions 2026-10-01, see claude/updates/pilot-clean-data-move.md).
-- Runs on a throw-away COPY of the dev database made by deploy/export-clean.sh — never on kunkhmer_db itself.
-- Leaves out: the two demo fight nights (3 and 10 Oct 2026) with their cards and bouts, the 9 demo officials,
-- the 8 deleted QA/demo fighters, the test fan account and the half-filled private fighter record.
-- Keeps: all 27 active fighters, the 5 clubs, the 10 July 2026 event, news, videos, partners, settings lists,
-- knowledge base, the federation page draft and the admin account.
-- Every step checks how many rows it removed and stops (rolls everything back) if that number is unexpected.
\set ON_ERROR_STOP on
BEGIN;

DO $$
DECLARE n int;
BEGIN
  -- Demo fight nights; cards, bouts and event sponsors go with them (ON DELETE CASCADE).
  DELETE FROM events
   WHERE (name = 'KKF Saturday Fight Night' AND date = '2026-10-03')
      OR (name = 'KKF Saturday Fight Night 2' AND date = '2026-10-10');
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 2 THEN RAISE EXCEPTION 'expected 2 demo events, found %', n; END IF;

  -- Demo officials (bouts that pointed at them are gone already).
  DELETE FROM users
   WHERE username ~ '^demo\.(referee[1-3]|judge[1-6])$' AND email LIKE '%@demo.kkf.local';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 9 THEN RAISE EXCEPTION 'expected 9 demo officials, found %', n; END IF;

  -- Fighters deleted earlier (QA and demo records); nothing else points at them.
  DELETE FROM fighters WHERE deleted_at IS NOT NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 8 THEN RAISE EXCEPTION 'expected 8 deleted fighters, found %', n; END IF;

  -- Test fan account (its follows, sessions and notifications cascade).
  DELETE FROM fans;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'expected 1 test fan, found %', n; END IF;

  -- Half-filled private record (no ID number scan, no consent).
  DELETE FROM fighter_private;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'expected 1 private fighter record, found %', n; END IF;

  -- What must remain.
  SELECT count(*) INTO n FROM fighters;           IF n <> 27 THEN RAISE EXCEPTION 'expected 27 fighters left, found %', n; END IF;
  SELECT count(*) INTO n FROM clubs;              IF n <> 5  THEN RAISE EXCEPTION 'expected 5 clubs left, found %', n; END IF;
  SELECT count(*) INTO n FROM events;             IF n <> 1  THEN RAISE EXCEPTION 'expected 1 event left, found %', n; END IF;
  SELECT count(*) INTO n FROM users;              IF n <> 1  THEN RAISE EXCEPTION 'expected only the admin account left, found %', n; END IF;
END $$;

COMMIT;
