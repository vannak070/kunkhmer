-- KKF ID for every fighter: "KKF-000123", one running number (at least 6 digits), never reused.
CREATE SEQUENCE "fighter_kkf_seq" START 1;

CREATE FUNCTION kkf_next_id() RETURNS text LANGUAGE sql VOLATILE AS $$
  SELECT 'KKF-' || lpad(n::text, greatest(6, length(n::text)), '0') FROM (SELECT nextval('fighter_kkf_seq') AS n) s
$$;

ALTER TABLE "fighters" ADD COLUMN "kkf_id" VARCHAR(20);

-- Existing fighters (deleted ones too, so a number is never handed out twice) in the order they were registered.
WITH ordered AS (
  SELECT id, row_number() OVER (ORDER BY created_at NULLS FIRST, id) AS n FROM "fighters"
)
UPDATE "fighters" f
SET "kkf_id" = 'KKF-' || lpad(o.n::text, greatest(6, length(o.n::text)), '0')
FROM ordered o
WHERE f.id = o.id;

SELECT setval('fighter_kkf_seq', GREATEST((SELECT count(*) FROM "fighters"), 1), (SELECT count(*) FROM "fighters") > 0);

ALTER TABLE "fighters" ALTER COLUMN "kkf_id" SET NOT NULL;
ALTER TABLE "fighters" ALTER COLUMN "kkf_id" SET DEFAULT kkf_next_id();

-- CreateIndex
CREATE UNIQUE INDEX "fighters_kkf_id_key" ON "fighters"("kkf_id");
