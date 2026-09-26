-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "club_a_note" TEXT,
ADD COLUMN     "club_a_responded_at" TIMESTAMP(0),
ADD COLUMN     "club_a_responded_by" UUID,
ADD COLUMN     "club_b_note" TEXT,
ADD COLUMN     "club_b_responded_at" TIMESTAMP(0),
ADD COLUMN     "club_b_responded_by" UUID;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_club_a_responded_by_foreign" FOREIGN KEY ("club_a_responded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_club_b_responded_by_foreign" FOREIGN KEY ("club_b_responded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- Bouts created before club confirmation existed were agreed outside the
-- system: mark them accepted so they stay on the public site.
UPDATE "matches" SET "proposal_status" = 'accepted', "club_a_response" = 'accepted', "club_b_response" = 'accepted'
WHERE "proposal_status" = 'draft';
