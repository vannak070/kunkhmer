-- Medical status and suspension can now be set on the fighter page, so these two matching rules start ON.
-- (Every fighter is "Cleared" with no suspension unless staff change it, so nothing is blocked by this alone.)
UPDATE "matching_rules" SET "enabled" = true WHERE "key" IN ('medical', 'suspension');
