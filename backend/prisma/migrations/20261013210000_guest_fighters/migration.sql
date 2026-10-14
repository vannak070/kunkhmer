-- Foreign (guest) fighters may be registered without a date of birth or height.
ALTER TABLE "fighters" ALTER COLUMN "date_of_birth" DROP NOT NULL,
ALTER COLUMN "height" DROP NOT NULL;
