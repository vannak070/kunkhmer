-- CreateTable
CREATE TABLE "weight_classes" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "name_khmer" VARCHAR(100),
    "min_kg" DECIMAL(5,2),
    "max_kg" DECIMAL(5,2),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "weight_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "region" VARCHAR(255),
    "description" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bout_rules" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_khmer" VARCHAR(255),
    "rounds" INTEGER NOT NULL,
    "round_time" INTEGER NOT NULL,
    "knockdown_limit" INTEGER NOT NULL,
    "glove_size" VARCHAR(10),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "bout_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glove_brands" (
    "id" UUID NOT NULL,
    "brand" VARCHAR(255) NOT NULL,
    "model" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "glove_brands_pkey" PRIMARY KEY ("id")
);

-- Starting lists: what the admin kept in each browser before Phase 5.

INSERT INTO "weight_classes" ("id", "name", "min_kg", "max_kg", "sort_order", "active", "created_at", "updated_at") VALUES
('67cde1ed-b085-444e-99e4-4b1d6480a4ed', 'Under 45 kg', NULL, 45, 0, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('7bd7fb8d-1cd3-42c3-8083-d4557ed001bc', '45 kg - 47 kg', 45, 47, 1, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('ead73818-1b08-4772-a4b0-9ec9ef5d9caf', '48 kg - 49 kg', 48, 49, 2, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('9705ed91-6afa-4bc3-93fd-895c36721af1', '50 kg - 52 kg', 50, 52, 3, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('37d1970b-61b1-4a1c-be30-09660132a043', '53 kg - 55 kg', 53, 55, 4, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('24883f04-1294-48d0-823e-fd1169e931df', '56 kg - 58 kg', 56, 58, 5, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('80df6255-e54c-4943-8a62-d311d9d4ecf3', '59 kg - 61 kg', 59, 61, 6, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('a5fafcc6-3c38-4343-aa2b-2a9e3891b04e', '62 kg - 64 kg', 62, 64, 7, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('e5e9d082-ed45-43e3-af56-5b4e43f10ee5', '65 kg - 67 kg', 65, 67, 8, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('876c0c4c-9bf2-4923-b5d3-8389762877bf', '68 kg - 70 kg', 68, 70, 9, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('672ec563-dab7-4b4f-9416-6bb0fc5a04b8', '71 kg - 73 kg', 71, 73, 10, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('ff37a4ad-6384-4f90-8e1d-9d08dc6f13f9', '74 kg - 76 kg', 74, 76, 11, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('7705d3d1-9675-48e4-aea7-a1166e5b91ec', '77 kg - 80 kg', 77, 80, 12, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('6663f9a3-7840-4af6-85f6-8802656c97e6', 'Over 80 kg', 80, NULL, 13, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC');

INSERT INTO "venues" ("id", "name", "region", "description", "latitude", "longitude", "sort_order", "active", "created_at", "updated_at") VALUES
('0606bedf-34d0-44ae-b333-b4dfc42b9f47', 'Morodok Techo National Stadium', 'Phnom Penh (National)', 'Main national stadium with 75,000 capacity', 11.697, 104.9125, 0, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('05b4a1ac-34e2-4088-8486-c04ce248ed8e', 'Olympic Stadium Arena', 'Phnom Penh', 'Historic indoor and outdoor national sports complex', 11.5564, 104.9282, 1, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('b1f186a5-dbc3-472f-9308-5a4bbe1ec718', 'Town Full HDTV Arena', 'Phnom Penh', 'State-of-the-art modern Kun Khmer broadcast arena', 11.5725, 104.8988, 2, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('65e452a9-621f-4537-a784-7ece3628007a', 'Bayon TV Arena (Steung Meanchey)', 'Phnom Penh', 'Famous arena hosting weekend championship tournaments', 11.5301, 104.895, 3, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('eba318ba-f013-4509-ad49-2ae5afd4b8a1', 'PNN Arena (Prek Pnov)', 'Phnom Penh Outskirts', 'Premium television broadcast stadium', 11.6611, 104.8814, 4, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('15966526-f9f8-40b4-a1d8-0de273dedae5', 'Siem Reap Boxing Stadium', 'Siem Reap', 'Popular stadium hosting fights for domestic and international fans', 13.3671, 103.8566, 5, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('6800ec2f-84ef-4b1d-aa2e-bf9bbff920ee', 'Battambang Indoor Stadium', 'Battambang', 'Provincial stadium hosting major regional galas', 13.0957, 103.2022, 6, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC');

INSERT INTO "bout_rules" ("id", "name", "name_khmer", "rounds", "round_time", "knockdown_limit", "glove_size", "sort_order", "active", "created_at", "updated_at") VALUES
('07326554-32c8-4373-8dee-8db6e5ba50b8', 'Standard (5 rounds × 3 min)', 'ប្រាំទឹក (៥ ទឹក x ៣ នាទី)', 5, 3, 3, '8oz', 0, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('97ee9a80-3f6b-4270-8d6b-70357a6661cd', 'Exhibition (3 rounds × 2 min)', 'ការប្រកួតលក្ខណៈមិត្តភាព', 3, 2, 3, '10oz', 1, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC');

INSERT INTO "glove_brands" ("id", "brand", "model", "sort_order", "active", "created_at", "updated_at") VALUES
('d8fcbd0d-bb43-4327-bc98-734e59b67340', 'Twins Special', 'BGVL-3', 0, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('94308f07-a12d-484d-81ca-9d60d277c741', 'Fairtex', 'BGV1', 1, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('2f90295c-9f5a-4659-994b-80cd2c7b4ba6', 'Top King', 'Super Air', 2, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('62ee98bc-bd89-4134-9604-41fa3d6d2d22', 'Boon', 'Retro', 3, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('6f132470-32b6-48bb-bb58-19f31f74944d', 'Yokkao', 'Matrix', 4, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('1f815332-43c1-40f7-98f5-bf50dd25f4ae', 'Raja Boxing', 'RBG-1', 5, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('f7000047-33a7-403f-a829-75ae3de99519', 'Windy', 'BGVH', 6, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC'),
('9b3ea980-0439-47bb-9cd6-ede33d152312', 'Venum', 'Elite', 7, true, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC');
