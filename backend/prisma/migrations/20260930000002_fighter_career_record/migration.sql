-- Career record before this system (claude/updates/program-officer-friendly.md): the displayed `record`
-- becomes career + results recorded here, instead of results recorded here only.
ALTER TABLE "fighters" ADD COLUMN "career_record" VARCHAR(20);

-- Fighters with no recorded result: their record is their career. Fighters with recorded results had their
-- record rebuilt from those results only, so their known career before this system is 0-0-0.
UPDATE "fighters" f SET "career_record" = CASE
  WHEN EXISTS (
    SELECT 1 FROM "matches" m JOIN "bout_results" r ON r."match_id" = m."id"
    WHERE m."status" = 'Completed' AND (m."fighter_a_id" = f."id" OR m."fighter_b_id" = f."id")
  ) THEN '0-0-0'
  ELSE f."record"
END;
