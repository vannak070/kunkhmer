-- CreateTable
CREATE TABLE "knowledge_articles" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "title_en" VARCHAR(255) NOT NULL,
    "title_km" VARCHAR(255),
    "body_en" TEXT NOT NULL,
    "body_km" TEXT,
    "km_reviewed" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Draft',
    "source" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by" VARCHAR(255),
    "updated_by" VARCHAR(255),
    "published_by" VARCHAR(255),
    "published_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "knowledge_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_articles_slug_key" ON "knowledge_articles"("slug");

-- CreateIndex
CREATE INDEX "knowledge_articles_status_idx" ON "knowledge_articles"("status");

