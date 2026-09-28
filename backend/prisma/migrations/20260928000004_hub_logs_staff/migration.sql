-- KUNKHMER HUB Phase D2: staff assistant answers share hub_logs with fan answers.
-- source: public (anonymous fan answers) | staff (admin staff assistant, records who asked).
ALTER TABLE "hub_logs" ADD COLUMN "source" VARCHAR(10) NOT NULL DEFAULT 'public';
ALTER TABLE "hub_logs" ADD COLUMN "user_id" UUID;

ALTER TABLE "hub_logs" ADD CONSTRAINT "hub_logs_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
