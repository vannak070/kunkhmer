-- Sheet like KKF's paper (claude/updates/sheet-like-paper-week-print.md): free bout wording and tournament draw names.
ALTER TABLE "matches" ADD COLUMN "bout_label_text" VARCHAR(120);
ALTER TABLE "matches" ADD COLUMN "draw_name" VARCHAR(120);
