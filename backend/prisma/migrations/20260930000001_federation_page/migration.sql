-- About the Federation page (claude/features/about-federation.md): one row with the staff draft and the published copy.
CREATE TABLE "federation_page" (
    "key" VARCHAR(20) NOT NULL DEFAULT 'main',
    "draft" JSONB NOT NULL DEFAULT '{}',
    "published" JSONB,
    "draft_updated_at" TIMESTAMP(0),
    "draft_updated_by" VARCHAR(255),
    "published_at" TIMESTAMP(0),
    "published_by" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "federation_page_pkey" PRIMARY KEY ("key")
);
