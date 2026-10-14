-- Owner decision 2026-10-13: youth fighters are normal fighters, so the minimum age rule ships switched off
-- (KKF can still switch it on in System Settings › Matching rules). claude/features/weekly-program.md
UPDATE "matching_rules" SET "enabled" = false WHERE "key" = 'min_age';
