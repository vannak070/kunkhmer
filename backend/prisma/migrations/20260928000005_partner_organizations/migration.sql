-- International partners (K-1, WKN, Kombat …): promotions / sanctioning bodies KKF works with.
CREATE TABLE "partner_organizations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "short_name" VARCHAR(50),
    "org_type" VARCHAR(50) NOT NULL DEFAULT 'Promotion',
    "country" VARCHAR(100),
    "logo_url" TEXT,
    "image" TEXT,
    "description" TEXT,
    "description_km" TEXT,
    "partner_since" INTEGER,
    "website_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "partner_organizations_pkey" PRIMARY KEY ("id")
);
