-- KUNKHMER HUB Phase D3: public answers record only whether the asker was a signed-in fan (never which fan).
ALTER TABLE "hub_logs" ADD COLUMN "signed_in" BOOLEAN NOT NULL DEFAULT false;
