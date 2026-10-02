ALTER TABLE "venues" ADD COLUMN "name_khmer" VARCHAR(255),
ADD COLUMN "region_khmer" VARCHAR(255);
ALTER TABLE "associations" ADD COLUMN "name_khmer" VARCHAR(255);
ALTER TABLE "clubs" ADD COLUMN "association_khmer" VARCHAR(255);
