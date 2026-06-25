<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DefaultSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'id' => (string) Str::uuid(),
                'username' => 'admin',
                'full_name' => 'System Administrator',
                'email' => 'admin@kkf.gov.kh',
                'password_hash' => 'admin123',
                'role' => 'Super Admin',
                'status' => 'Active',
                'club_id' => null,
            ],
        ];
        DB::table('users')->insert($users);
    }
}
