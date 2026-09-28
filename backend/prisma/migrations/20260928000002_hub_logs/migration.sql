-- CreateTable
CREATE TABLE "hub_logs" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "conversation_id" VARCHAR(64),
    "lang" VARCHAR(5) NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "outcome" VARCHAR(20) NOT NULL,
    "tools" JSONB NOT NULL DEFAULT '[]',
    "model" VARCHAR(100) NOT NULL,
    "input_tokens" INTEGER NOT NULL DEFAULT 0,
    "output_tokens" INTEGER NOT NULL DEFAULT 0,
    "cache_read_tokens" INTEGER NOT NULL DEFAULT 0,
    "cache_write_tokens" INTEGER NOT NULL DEFAULT 0,
    "cost_usd" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "duration_ms" INTEGER NOT NULL DEFAULT 0,
    "feedback" SMALLINT,
    "feedback_at" TIMESTAMP(0),

    CONSTRAINT "hub_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hub_rate_limits" (
    "key" VARCHAR(64) NOT NULL,
    "window_start" TIMESTAMP(0) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "hub_rate_limits_pkey" PRIMARY KEY ("key","window_start")
);

-- CreateIndex
CREATE INDEX "hub_logs_created_at_idx" ON "hub_logs"("created_at");
