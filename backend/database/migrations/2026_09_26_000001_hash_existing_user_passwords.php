<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Hash any passwords still stored as plain text.
     */
    public function up(): void
    {
        DB::table('users')->select('id', 'password_hash')->orderBy('id')->each(function ($user) {
            if (!Hash::isHashed($user->password_hash)) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['password_hash' => Hash::make($user->password_hash)]);
            }
        });
    }

    /**
     * Hashing is one-way; nothing to reverse.
     */
    public function down(): void
    {
    }
};
