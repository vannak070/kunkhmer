-- CreateTable
CREATE TABLE "matching_rules" (
    "key" VARCHAR(50) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "action" VARCHAR(10) NOT NULL DEFAULT 'block',
    "value" DECIMAL(6,2),
    "unit" VARCHAR(20),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(0),
    "updated_by" UUID,

    CONSTRAINT "matching_rules_pkey" PRIMARY KEY ("key")
);

-- Starting rules. The numbers are placeholders until KKF confirms them (System Settings → Matching rules).
INSERT INTO "matching_rules" ("key", "label", "description", "enabled", "action", "value", "unit", "sort_order") VALUES
  ('medical',      'Medical clearance',   'Both fighters must have medical status Cleared.',                                   false, 'block', NULL, NULL,    1),
  ('suspension',   'Suspension',          'A fighter suspended on the fight date cannot be matched.',                          false, 'block', NULL, NULL,    2),
  ('same_gender',  'Same gender',         'Both fighters must be the same gender.',                                            true,  'block', NULL, NULL,    3),
  ('min_age',      'Minimum age',         'Both fighters must be at least this old on the fight date.',                        true,  'block', 16,   'years', 4),
  ('weight_gap',   'Weight gap',          'The agreed weight must be within this many kg of each fighter''s current weight.',  true,  'warn',  2,    'kg',    5),
  ('grade_gap',    'Grade gap',           'The fighters'' grades (A–D) may differ by at most this many steps.',                true,  'warn',  1,    'steps', 6),
  ('record_gap',   'Record gap',          'The fighters'' number of wins may differ by at most this many.',                    true,  'warn',  10,   'wins',  7),
  ('rest_days',    'Rest between fights', 'Each fighter needs at least this many days between bouts.',                         true,  'block', 21,   'days',  8),
  ('same_club',    'Same club',           'Two fighters of the same club should not meet.',                                    true,  'warn',  NULL, NULL,    9),
  ('already_booked','Already booked',     'A fighter cannot be in two bouts on the same fight card or the same day.',                         true,  'block', NULL, NULL,    10);
