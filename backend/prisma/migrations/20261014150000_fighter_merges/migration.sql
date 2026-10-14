-- Log of merged fighter records. claude/updates/fighter-id-merge.md
CREATE TABLE "fighter_merges" (
    "id" UUID NOT NULL,
    "kept_id" UUID NOT NULL,
    "removed_id" UUID NOT NULL,
    "removed_name" VARCHAR(255) NOT NULL,
    "merged_by" UUID,
    "merged_at" TIMESTAMP(0) NOT NULL,
    "summary" JSON NOT NULL,

    CONSTRAINT "fighter_merges_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "fighter_merges_kept_id_idx" ON "fighter_merges"("kept_id");
