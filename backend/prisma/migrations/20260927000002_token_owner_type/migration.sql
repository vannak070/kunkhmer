-- Staff tokens created before this migration recorded their owner type as the
-- old backend's class name. Use the plain type "user" so existing sessions keep
-- working with the current code.
UPDATE "personal_access_tokens" SET "tokenable_type" = 'user' WHERE "tokenable_type" = 'App\Models\User';
