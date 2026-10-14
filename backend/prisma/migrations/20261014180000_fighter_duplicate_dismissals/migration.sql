-- CreateTable
CREATE TABLE "fighter_duplicate_dismissals" (
    "fighter_a_id" UUID NOT NULL,
    "fighter_b_id" UUID NOT NULL,
    "dismissed_by" UUID,
    "dismissed_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "fighter_duplicate_dismissals_pkey" PRIMARY KEY ("fighter_a_id","fighter_b_id")
);
