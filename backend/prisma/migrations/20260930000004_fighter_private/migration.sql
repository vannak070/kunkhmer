-- Private fighter details (ID / KYC, emergency contact, medical): claude/features/fighter-personal-records.md.
-- Staff only; documents are stored in a private folder, the columns hold file names.
CREATE TABLE "fighter_private" (
    "fighter_id" UUID NOT NULL,
    "id_type" VARCHAR(50),
    "id_number" VARCHAR(100),
    "id_expiry" DATE,
    "id_document" VARCHAR(100),
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "address" TEXT,
    "emergency_name" VARCHAR(255),
    "emergency_relation" VARCHAR(100),
    "emergency_phone" VARCHAR(50),
    "guardian_name" VARCHAR(255),
    "guardian_phone" VARCHAR(50),
    "blood_type" VARCHAR(5),
    "last_medical_check" DATE,
    "medical_expiry" DATE,
    "medical_notes" TEXT,
    "medical_document" VARCHAR(100),
    "consent_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "fighter_private_pkey" PRIMARY KEY ("fighter_id")
);

ALTER TABLE "fighter_private" ADD CONSTRAINT "fighter_private_fighter_id_fkey" FOREIGN KEY ("fighter_id") REFERENCES "fighters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
