
-- CreateTable
CREATE TABLE "championship_changes" (
    "id" UUID NOT NULL,
    "seq" SERIAL NOT NULL,
    "champion_id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "before" JSONB NOT NULL,
    "applied_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "championship_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "championship_changes_match_id_key" ON "championship_changes"("match_id");

-- CreateIndex
CREATE INDEX "championship_changes_champion_id_seq_idx" ON "championship_changes"("champion_id", "seq");

-- AddForeignKey
ALTER TABLE "championship_changes" ADD CONSTRAINT "championship_changes_champion_id_foreign" FOREIGN KEY ("champion_id") REFERENCES "champions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "championship_changes" ADD CONSTRAINT "championship_changes_match_id_foreign" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

