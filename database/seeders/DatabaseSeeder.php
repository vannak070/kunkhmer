<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Clubs
        $clubs = [
            [
                'id' => (string) Str::uuid(),
                'name' => 'Phnom Penh Top Team',
                'name_khmer' => 'ភ្នំពេញ ថប ធីម',
                'location' => 'Phnom Penh, Cambodia',
                'head_coach' => 'Chan Reach',
                'status' => 'active',
                'rating' => 4.8,
                'image' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2940&auto=format&fit=crop',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Siem Reap Warriors',
                'name_khmer' => 'សៀមរាប វ៉ររៀរ',
                'location' => 'Siem Reap, Cambodia',
                'head_coach' => 'Sok Rith',
                'status' => 'active',
                'rating' => 4.5,
                'image' => 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=2940&auto=format&fit=crop',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Battambang Strikers',
                'name_khmer' => 'បាត់ដំបង ស្ទ្រីតឃើ',
                'location' => 'Battambang, Cambodia',
                'head_coach' => 'Meas Chanta',
                'status' => 'inactive',
                'rating' => 4.2,
                'image' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2940&auto=format&fit=crop',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Kampot Fight Club',
                'name_khmer' => 'កំពត ហ្វាយ ខ្លឹប',
                'location' => 'Kampot, Cambodia',
                'head_coach' => 'Heng Virak',
                'status' => 'active',
                'rating' => 4.3,
                'image' => 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=2940&auto=format&fit=crop',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Angkor Elite Academy',
                'name_khmer' => 'អង្គរ អេលីត អាខាដេមី',
                'location' => 'Siem Reap, Cambodia',
                'head_coach' => 'Keo Vy',
                'status' => 'active',
                'rating' => 4.7,
                'image' => 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?q=80&w=2940&auto=format&fit=crop',
            ],
        ];
        DB::table('clubs')->insert($clubs);

        $getClubId = function ($name) use ($clubs) {
            foreach ($clubs as $club) {
                if ($club['name'] === $name) {
                    return $club['id'];
                }
            }
            return null;
        };

        // 2. Seed Users
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
            [
                'id' => (string) Str::uuid(),
                'username' => 'officer',
                'full_name' => 'Sreymom Keo',
                'email' => 'officer@kkf.gov.kh',
                'password_hash' => 'officer123',
                'role' => 'KKF Officer',
                'status' => 'Active',
                'club_id' => null,
            ],
            [
                'id' => (string) Str::uuid(),
                'username' => 'organizer',
                'full_name' => 'Town Full HDTV',
                'email' => 'events@townfullhdtv.com',
                'password_hash' => 'org123',
                'role' => 'Organizer',
                'status' => 'Active',
                'club_id' => null,
            ],
            [
                'id' => (string) Str::uuid(),
                'username' => 'manager',
                'full_name' => 'Chey Rithy',
                'email' => 'manager@kkf.gov.kh',
                'password_hash' => 'manager123',
                'role' => 'KKF Officer',
                'status' => 'Active',
                'club_id' => null,
            ],
            [
                'id' => (string) Str::uuid(),
                'username' => 'club',
                'full_name' => 'Kiry Sak',
                'email' => 'club@gym.com',
                'password_hash' => 'club123',
                'role' => 'Club/Gym',
                'status' => 'Active',
                'club_id' => $getClubId('Phnom Penh Top Team'),
            ],
        ];
        DB::table('users')->insert($users);

        $getUserId = function ($username) use ($users) {
            foreach ($users as $user) {
                if ($user['username'] === $username) {
                    return $user['id'];
                }
            }
            return null;
        };

        // 3. Seed Fighters
        $fighters = [
            [
                'id' => (string) Str::uuid(),
                'name' => 'Sorn Seavmey',
                'name_khmer' => 'សន សៀវម៉ី',
                'alias' => 'The Tiger',
                'date_of_birth' => '1995-09-14',
                'nationality' => 'Cambodian',
                'province' => 'Phnom Penh',
                'gender' => 'Female',
                'current_weight' => 65.8,
                'height' => 1.83,
                'club_id' => $getClubId('Phnom Penh Top Team'),
                'record' => '34-5-2',
                'grade' => 'A',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1636581563815-9c40c35abe0b?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Chan Rothana',
                'name_khmer' => 'ចាន់ រតនា',
                'alias' => 'Dragon',
                'date_of_birth' => '1986-07-01',
                'nationality' => 'Cambodian',
                'province' => 'Phnom Penh',
                'gender' => 'Male',
                'current_weight' => 61.2,
                'height' => 1.72,
                'club_id' => $getClubId('Siem Reap Warriors'),
                'record' => '28-8-0',
                'grade' => 'A',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Nou Srey Pov',
                'name_khmer' => 'នូ ស្រីពៅ',
                'alias' => 'Iron Hands',
                'date_of_birth' => '1998-10-20',
                'nationality' => 'Cambodian',
                'province' => 'Battambang',
                'gender' => 'Female',
                'current_weight' => 52.2,
                'height' => 1.58,
                'club_id' => $getClubId('Battambang Strikers'),
                'record' => '19-3-1',
                'grade' => 'B',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1602827115160-a9e732f05533?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Prak Sophea',
                'name_khmer' => 'ប្រាក់ សុភ័ក្រ',
                'alias' => 'The Elbow King',
                'date_of_birth' => '1993-04-12',
                'nationality' => 'Cambodian',
                'province' => 'Phnom Penh',
                'gender' => 'Male',
                'current_weight' => 57.5,
                'height' => 1.68,
                'club_id' => $getClubId('Phnom Penh Top Team'),
                'record' => '42-7-1',
                'grade' => 'A',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1601039834001-7d32a613c60d?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Kem Sitha',
                'name_khmer' => 'កឹម ស៊ីថា',
                'alias' => 'Thunder Kick',
                'date_of_birth' => '1997-02-18',
                'nationality' => 'Cambodian',
                'province' => 'Siem Reap',
                'gender' => 'Male',
                'current_weight' => 63.2,
                'height' => 1.70,
                'club_id' => $getClubId('Siem Reap Warriors'),
                'record' => '31-12-3',
                'grade' => 'B',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Chea Vibol',
                'name_khmer' => 'ជា វិបុល',
                'alias' => 'The Phantom',
                'date_of_birth' => '1996-11-22',
                'nationality' => 'Cambodian',
                'province' => 'Battambang',
                'gender' => 'Male',
                'current_weight' => 68.0,
                'height' => 1.75,
                'club_id' => $getClubId('Battambang Strikers'),
                'record' => '25-15-2',
                'grade' => 'B',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Sam Phirun',
                'name_khmer' => 'សំ ភិរុណ',
                'alias' => 'Golden Gloves',
                'date_of_birth' => '1994-08-05',
                'nationality' => 'Cambodian',
                'province' => 'Battambang',
                'gender' => 'Male',
                'current_weight' => 54.3,
                'height' => 1.65,
                'club_id' => $getClubId('Battambang Strikers'),
                'record' => '39-9-2',
                'grade' => 'A',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Lao Chetra',
                'name_khmer' => 'ឡៅ ចិត្រា',
                'alias' => 'The Iron Fist',
                'date_of_birth' => '1999-05-10',
                'nationality' => 'Cambodian',
                'province' => 'Kampong Speu',
                'gender' => 'Male',
                'current_weight' => 63.5,
                'height' => 1.71,
                'club_id' => $getClubId('Phnom Penh Top Team'),
                'record' => '58-8-3',
                'grade' => 'A',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Falcon',
                'name_khmer' => 'ហ្វាល់ខន',
                'alias' => 'The Winged Falcon',
                'date_of_birth' => '2001-01-01',
                'nationality' => 'French',
                'province' => 'Siem Reap',
                'gender' => 'Male',
                'current_weight' => 63.5,
                'height' => 1.76,
                'club_id' => $getClubId('Siem Reap Warriors'),
                'record' => '12-4-0',
                'grade' => 'B',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Sok Thy',
                'name_khmer' => 'សុក ធី',
                'alias' => 'The Kick Machine',
                'date_of_birth' => '1997-12-05',
                'nationality' => 'Cambodian',
                'province' => 'Siem Reap',
                'gender' => 'Male',
                'current_weight' => 60.0,
                'height' => 1.68,
                'club_id' => $getClubId('Siem Reap Warriors'),
                'record' => '120-22-5',
                'grade' => 'A',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Khun Dima',
                'name_khmer' => 'ឃុន ឌីម៉ា',
                'alias' => 'Elbow Specialist',
                'date_of_birth' => '1994-05-15',
                'nationality' => 'Cambodian',
                'province' => 'Kampot',
                'gender' => 'Male',
                'current_weight' => 63.5,
                'height' => 1.72,
                'club_id' => $getClubId('Kampot Fight Club'),
                'record' => '85-15-4',
                'grade' => 'A',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Keo Rumchong',
                'name_khmer' => 'កែវ រំចង់',
                'alias' => 'The Iron Man',
                'date_of_birth' => '1889-01-01',
                'nationality' => 'Cambodian',
                'province' => 'Battambang',
                'gender' => 'Male',
                'current_weight' => 70.0,
                'height' => 1.70,
                'club_id' => $getClubId('Battambang Strikers'),
                'record' => '145-30-6',
                'grade' => 'A',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Srey Chanthy',
                'name_khmer' => 'ស្រី ចាន់ធី',
                'alias' => 'Golden Queen',
                'date_of_birth' => '2000-03-01',
                'nationality' => 'Cambodian',
                'province' => 'Siem Reap',
                'gender' => 'Female',
                'current_weight' => 54.0,
                'height' => 1.60,
                'club_id' => $getClubId('Angkor Elite Academy'),
                'record' => '22-3-1',
                'grade' => 'B',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Lao Chandra',
                'name_khmer' => 'ឡៅ ចន្ទ្រា',
                'alias' => 'Knee Destroyer',
                'date_of_birth' => '1998-07-20',
                'nationality' => 'Cambodian',
                'province' => 'Kampong Speu',
                'gender' => 'Male',
                'current_weight' => 65.0,
                'height' => 1.73,
                'club_id' => $getClubId('Phnom Penh Top Team'),
                'record' => '64-10-2',
                'grade' => 'A',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Thoeun Theara',
                'name_khmer' => 'ធឿន ធារ៉ា',
                'alias' => 'The King of Kun Khmer',
                'date_of_birth' => '1998-02-10',
                'nationality' => 'Cambodian',
                'province' => 'Prey Veng',
                'gender' => 'Male',
                'current_weight' => 72.0,
                'height' => 1.78,
                'club_id' => $getClubId('Kampot Fight Club'),
                'record' => '72-5-3',
                'grade' => 'A',
                'status' => 'Active',
                'professional_status' => 'Professional',
                'image' => 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
            ]
        ];
        DB::table('fighters')->insert($fighters);

        $getFighterId = function ($name) use ($fighters) {
            foreach ($fighters as $fighter) {
                if ($fighter['name'] === $name) {
                    return $fighter['id'];
                }
            }
            return null;
        };

        // 4. Seed Sponsors
        $sponsors = [
            ['id' => (string) Str::uuid(), 'name' => 'Ganzberg Beer', 'logo_url' => '🍺', 'tier' => 'Gold', 'active' => true],
            ['id' => (string) Str::uuid(), 'name' => 'Boost Strong', 'logo_url' => '⚡', 'tier' => 'Silver', 'active' => true],
            ['id' => (string) Str::uuid(), 'name' => 'Smart Axiata', 'logo_url' => '🟢', 'tier' => 'Platinum', 'active' => true],
            ['id' => (string) Str::uuid(), 'name' => 'Cellcard', 'logo_url' => '🟠', 'tier' => 'Gold', 'active' => true],
        ];
        DB::table('sponsors')->insert($sponsors);

        // 5. Seed Broadcast Stations
        $stations = [
            ['id' => (string) Str::uuid(), 'name' => 'Town Full HDTV', 'stream_url' => 'https://stream.townfullhdtv.com/live', 'type' => 'Cable TV', 'reach' => 'National', 'active' => true],
            ['id' => (string) Str::uuid(), 'name' => 'Bayon TV', 'stream_url' => 'https://stream.bayontv.com/live', 'type' => 'Cable TV', 'reach' => 'National', 'active' => true],
            ['id' => (string) Str::uuid(), 'name' => 'PNN', 'stream_url' => 'https://stream.pnn.com/live', 'type' => 'Cable TV', 'reach' => 'National', 'active' => true],
            ['id' => (string) Str::uuid(), 'name' => 'CTN', 'stream_url' => 'https://stream.ctn.com/live', 'type' => 'Cable TV', 'reach' => 'National', 'active' => true],
        ];
        DB::table('broadcast_stations')->insert($stations);

        $getStationId = function ($name) use ($stations) {
            foreach ($stations as $station) {
                if ($station['name'] === $name) {
                    return $station['id'];
                }
            }
            return null;
        };

        // 6. Seed Events
        $events = [
            [
                'id' => (string) Str::uuid(),
                'name' => 'Kun Khmer National Championship 2026',
                'date' => '2026-06-15',
                'location' => 'Olympic Stadium Arena, Phnom Penh',
                'status' => 'Published',
                'organizer_id' => $getUserId('organizer'),
                'broadcast_station_id' => $getStationId('Town Full HDTV'),
                'description' => 'The premier national league tournament of the year, bringing together Cambodia top gyms.',
                'image' => 'https://images.unsplash.com/photo-1574629810360-7efbc5eca0aa?auto=format&fit=crop&q=80&w=1200',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Siem Reap Fight Night',
                'date' => '2026-07-20',
                'location' => 'Siem Reap Boxing Stadium',
                'status' => 'Draft',
                'organizer_id' => $getUserId('organizer'),
                'broadcast_station_id' => $getStationId('Bayon TV'),
                'description' => 'A classic weekend fight card showcasing regional talents in Siem Reap.',
                'image' => 'https://images.unsplash.com/photo-1601039834001-7d32a613c60d?auto=format&fit=crop&q=80&w=1200',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Kun Khmer World Grand Prix 2026',
                'date' => '2026-08-10',
                'location' => 'Olympic Stadium Indoor Arena, Phnom Penh',
                'status' => 'Published',
                'organizer_id' => $getUserId('organizer'),
                'broadcast_station_id' => $getStationId('Bayon TV'),
                'description' => 'Top tier international event featuring the best fighters from around the globe.',
                'image' => 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200',
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Kampot King of the Ring',
                'date' => '2026-09-05',
                'location' => 'Kampot Boxing Stadium',
                'status' => 'Draft',
                'organizer_id' => $getUserId('organizer'),
                'broadcast_station_id' => $getStationId('Town Full HDTV'),
                'description' => 'A spectacular coastal championship event.',
                'image' => 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=1200',
            ],
        ];
        DB::table('events')->insert($events);

        $getEventId = function ($name) use ($events) {
            foreach ($events as $event) {
                if ($event['name'] === $name) {
                    return $event['id'];
                }
            }
            return null;
        };

        // 7. Seed Event Sponsors
        $eventSSponsorId = $getEventId('Kun Khmer National Championship 2026');
        if ($eventSSponsorId) {
            DB::table('event_sponsors')->insert([
                ['event_id' => $eventSSponsorId, 'sponsor_id' => $sponsors[0]['id']],
                ['event_id' => $eventSSponsorId, 'sponsor_id' => $sponsors[1]['id']],
            ]);
        }

        // 8. Seed SubEvents (Batches)
        $subEvents = [
            [
                'id' => 'e0c5fc5f-9323-4ac0-8035-a2f8848fe8a4',
                'event_id' => $getEventId('Kun Khmer National Championship 2026'),
                'name' => 'Week 1 Fight Card',
                'week_number' => 1,
                'date' => '2026-06-15',
                'location' => 'Olympic Stadium Arena, Phnom Penh',
                'phase' => 'Qualifier',
                'status' => 'Scheduled',
                'batch_number' => 'BATCH-001',
                'created_by' => $getUserId('officer1'),
            ],
            [
                'id' => '298ce981-ec05-4c44-adce-0225c0f93044',
                'event_id' => $getEventId('Kun Khmer National Championship 2026'),
                'name' => 'Week 2 Fight Card',
                'week_number' => 2,
                'date' => '2026-06-22',
                'location' => 'Olympic Stadium Arena, Phnom Penh',
                'phase' => 'Qualifier',
                'status' => 'Scheduled',
                'batch_number' => 'BATCH-002',
                'created_by' => $getUserId('officer1'),
            ]
        ];
        DB::table('sub_events')->insert($subEvents);

        // 9. Seed Matches
        $matches = [
            // Week 1 Matches
            [
                'id' => (string) Str::uuid(),
                'event_id' => $getEventId('Kun Khmer National Championship 2026'),
                'sub_event_id' => 'e0c5fc5f-9323-4ac0-8035-a2f8848fe8a4',
                'fighter_a_id' => $getFighterId('Lao Chetra'),
                'fighter_b_id' => $getFighterId('Falcon'),
                'rounds' => 3,
                'round_time' => 3,
                'knockdown_limit' => 3,
                'agreed_weight' => 63.5,
                'glove_size' => '8oz',
                'glove_brand' => 'FBT',
                'status' => 'Ready to Fight',
                'proposal_status' => 'accepted',
                'club_a_response' => 'accepted',
                'club_b_response' => 'accepted',
                'referee_id' => $getUserId('officer1'),
                'judge_ids' => json_encode([]),
            ],
            [
                'id' => (string) Str::uuid(),
                'event_id' => $getEventId('Kun Khmer National Championship 2026'),
                'sub_event_id' => 'e0c5fc5f-9323-4ac0-8035-a2f8848fe8a4',
                'fighter_a_id' => $getFighterId('Sorn Seavmey'),
                'fighter_b_id' => $getFighterId('Chan Rothana'),
                'rounds' => 5,
                'round_time' => 3,
                'knockdown_limit' => 3,
                'agreed_weight' => 65.0,
                'glove_size' => '10oz',
                'glove_brand' => 'Twins',
                'status' => 'Draft',
                'proposal_status' => 'draft',
                'club_a_response' => 'pending',
                'club_b_response' => 'pending',
                'referee_id' => null,
                'judge_ids' => json_encode([]),
            ],
            [
                'id' => (string) Str::uuid(),
                'event_id' => $getEventId('Kun Khmer National Championship 2026'),
                'sub_event_id' => 'e0c5fc5f-9323-4ac0-8035-a2f8848fe8a4',
                'fighter_a_id' => $getFighterId('Prak Sophea'),
                'fighter_b_id' => $getFighterId('Kem Sitha'),
                'rounds' => 3,
                'round_time' => 3,
                'knockdown_limit' => 3,
                'agreed_weight' => 57.5,
                'glove_size' => '8oz',
                'glove_brand' => 'FBT',
                'status' => 'Ready to Fight',
                'proposal_status' => 'accepted',
                'club_a_response' => 'accepted',
                'club_b_response' => 'accepted',
                'referee_id' => $getUserId('officer1'),
                'judge_ids' => json_encode([]),
            ],
            [
                'id' => (string) Str::uuid(),
                'event_id' => $getEventId('Kun Khmer National Championship 2026'),
                'sub_event_id' => 'e0c5fc5f-9323-4ac0-8035-a2f8848fe8a4',
                'fighter_a_id' => $getFighterId('Sam Phirun'),
                'fighter_b_id' => $getFighterId('Nou Srey Pov'),
                'rounds' => 3,
                'round_time' => 3,
                'knockdown_limit' => 3,
                'agreed_weight' => 54.3,
                'glove_size' => '8oz',
                'glove_brand' => 'Twins',
                'status' => 'Draft',
                'proposal_status' => 'draft',
                'club_a_response' => 'pending',
                'club_b_response' => 'pending',
                'referee_id' => null,
                'judge_ids' => json_encode([]),
            ],
            [
                'id' => (string) Str::uuid(),
                'event_id' => $getEventId('Kun Khmer National Championship 2026'),
                'sub_event_id' => 'e0c5fc5f-9323-4ac0-8035-a2f8848fe8a4',
                'fighter_a_id' => $getFighterId('Thoeun Theara'),
                'fighter_b_id' => $getFighterId('Chea Vibol'),
                'rounds' => 5,
                'round_time' => 3,
                'knockdown_limit' => 3,
                'agreed_weight' => 72.0,
                'glove_size' => '10oz',
                'glove_brand' => 'FBT',
                'status' => 'Club Confirmed',
                'proposal_status' => 'accepted',
                'club_a_response' => 'accepted',
                'club_b_response' => 'accepted',
                'referee_id' => $getUserId('officer1'),
                'judge_ids' => json_encode([]),
            ],
            // Week 2 Matches
            [
                'id' => (string) Str::uuid(),
                'event_id' => $getEventId('Kun Khmer National Championship 2026'),
                'sub_event_id' => '298ce981-ec05-4c44-adce-0225c0f93044',
                'fighter_a_id' => $getFighterId('Sok Thy'),
                'fighter_b_id' => $getFighterId('Falcon'),
                'rounds' => 3,
                'round_time' => 3,
                'knockdown_limit' => 3,
                'agreed_weight' => 60.0,
                'glove_size' => '8oz',
                'glove_brand' => 'Twins',
                'status' => 'Ready to Fight',
                'proposal_status' => 'accepted',
                'club_a_response' => 'accepted',
                'club_b_response' => 'accepted',
                'referee_id' => $getUserId('officer1'),
                'judge_ids' => json_encode([]),
            ],
            [
                'id' => (string) Str::uuid(),
                'event_id' => $getEventId('Kun Khmer National Championship 2026'),
                'sub_event_id' => '298ce981-ec05-4c44-adce-0225c0f93044',
                'fighter_a_id' => $getFighterId('Khun Dima'),
                'fighter_b_id' => $getFighterId('Nou Srey Pov'),
                'rounds' => 3,
                'round_time' => 3,
                'knockdown_limit' => 3,
                'agreed_weight' => 63.5,
                'glove_size' => '8oz',
                'glove_brand' => 'FBT',
                'status' => 'Pending Club Confirmation',
                'proposal_status' => 'pending',
                'club_a_response' => 'accepted',
                'club_b_response' => 'pending',
                'referee_id' => null,
                'judge_ids' => json_encode([]),
            ],
            [
                'id' => (string) Str::uuid(),
                'event_id' => $getEventId('Kun Khmer National Championship 2026'),
                'sub_event_id' => '298ce981-ec05-4c44-adce-0225c0f93044',
                'fighter_a_id' => $getFighterId('Keo Rumchong'),
                'fighter_b_id' => $getFighterId('Chan Rothana'),
                'rounds' => 5,
                'round_time' => 3,
                'knockdown_limit' => 3,
                'agreed_weight' => 70.0,
                'glove_size' => '10oz',
                'glove_brand' => 'Twins',
                'status' => 'Draft',
                'proposal_status' => 'draft',
                'club_a_response' => 'pending',
                'club_b_response' => 'pending',
                'referee_id' => null,
                'judge_ids' => json_encode([]),
            ],
            [
                'id' => (string) Str::uuid(),
                'event_id' => $getEventId('Kun Khmer National Championship 2026'),
                'sub_event_id' => '298ce981-ec05-4c44-adce-0225c0f93044',
                'fighter_a_id' => $getFighterId('Lao Chandra'),
                'fighter_b_id' => $getFighterId('Chea Vibol'),
                'rounds' => 5,
                'round_time' => 3,
                'knockdown_limit' => 3,
                'agreed_weight' => 72.0,
                'glove_size' => '10oz',
                'glove_brand' => 'FBT',
                'status' => 'Ready to Fight',
                'proposal_status' => 'accepted',
                'club_a_response' => 'accepted',
                'club_b_response' => 'accepted',
                'referee_id' => $getUserId('officer1'),
                'judge_ids' => json_encode([]),
            ],
        ];
        DB::table('matches')->insert($matches);

        // 10. Seed Champions
        $champions = [
            [
                'id' => (string) Str::uuid(),
                'title_name' => 'KKF National Champion 70kg',
                'champion_type' => 'KKF National',
                'weight_class' => 70.0,
                'organization' => 'KKF',
                'batch_id' => 'BATCH-001',
                'event_name' => 'Kun Khmer Championship 2026',
                'current_holder_id' => $getFighterId('Sorn Seavmey'),
                'current_holder_name' => 'Sorn Seavmey',
                'nationality' => 'Cambodian',
                'status' => 'Active',
                'defense_count' => 3,
                'notes' => 'Dominant performance in all title defenses',
            ],
            [
                'id' => (string) Str::uuid(),
                'title_name' => 'ISKA Cambodia Champion 60kg',
                'champion_type' => 'ISKA Cambodia',
                'weight_class' => 60.0,
                'organization' => 'KKF',
                'batch_id' => 'BATCH-002',
                'event_name' => 'Siem Reap Fight Night',
                'current_holder_id' => $getFighterId('Chan Rothana'),
                'current_holder_name' => 'Chan Rothana',
                'nationality' => 'Cambodian',
                'status' => 'Title Defense Scheduled',
                'defense_count' => 2,
                'notes' => 'Legendary veteran and champion',
            ],
            [
                'id' => (string) Str::uuid(),
                'title_name' => 'KKF Welterweight Belt 72kg',
                'champion_type' => 'KKF National',
                'weight_class' => 72.0,
                'organization' => 'KKF',
                'batch_id' => 'BATCH-002',
                'event_name' => 'Kun Khmer National Championship 2026',
                'current_holder_id' => $getFighterId('Thoeun Theara'),
                'current_holder_name' => 'Thoeun Theara',
                'nationality' => 'Cambodian',
                'status' => 'Active',
                'defense_count' => 4,
                'notes' => 'The reigning undisputed champion',
            ],
            [
                'id' => (string) Str::uuid(),
                'title_name' => 'Kun Khmer World Belt 60kg',
                'champion_type' => 'IPCC International',
                'weight_class' => 60.0,
                'organization' => 'IPCC',
                'batch_id' => 'BATCH-001',
                'event_name' => 'Kun Khmer World Grand Prix 2026',
                'current_holder_id' => $getFighterId('Sok Thy'),
                'current_holder_name' => 'Sok Thy',
                'nationality' => 'Cambodian',
                'status' => 'Active',
                'defense_count' => 1,
                'notes' => 'Won in an international championship bout',
            ],
            [
                'id' => (string) Str::uuid(),
                'title_name' => 'Bayon TV Championship Trophy 63.5kg',
                'champion_type' => 'Tournament Winner',
                'weight_class' => 63.5,
                'organization' => 'Bayon TV',
                'batch_id' => 'BATCH-002',
                'event_name' => 'Siem Reap Fight Night',
                'current_holder_id' => $getFighterId('Khun Dima'),
                'current_holder_name' => 'Khun Dima',
                'nationality' => 'Cambodian',
                'status' => 'Active',
                'defense_count' => 0,
                'notes' => 'Won the 2025 Bayon TV Tournament',
            ],
        ];
        DB::table('champions')->insert($champions);

        $getChampionId = function ($title) use ($champions) {
            foreach ($champions as $champion) {
                if ($champion['title_name'] === $title) {
                    return $champion['id'];
                }
            }
            return null;
        };

        // 11. Seed Champion Defenses
        $defenses = [
            // Seavmey defenses
            [
                'id' => (string) Str::uuid(),
                'champion_id' => $getChampionId('KKF National Champion 70kg'),
                'event_name' => 'Kun Khmer National Championship 2026',
                'date' => '2026-06-15',
                'opponent' => 'Nou Srey Pov',
                'opponent_id' => $getFighterId('Nou Srey Pov'),
                'result' => 'Won',
                'method' => 'Decision',
                'round' => 5,
            ],
            [
                'id' => (string) Str::uuid(),
                'champion_id' => $getChampionId('KKF National Champion 70kg'),
                'event_name' => 'Siem Reap Fight Night',
                'date' => '2026-04-10',
                'opponent' => 'Foreign Challenger',
                'opponent_id' => null,
                'result' => 'Won',
                'method' => 'KO',
                'round' => 2,
            ],
            // Rothana defenses
            [
                'id' => (string) Str::uuid(),
                'champion_id' => $getChampionId('ISKA Cambodia Champion 60kg'),
                'event_name' => 'Siem Reap Fight Night',
                'date' => '2026-05-20',
                'opponent' => 'Kem Sitha',
                'opponent_id' => $getFighterId('Kem Sitha'),
                'result' => 'Won',
                'method' => 'TKO',
                'round' => 4,
            ],
            // Theara defenses
            [
                'id' => (string) Str::uuid(),
                'champion_id' => $getChampionId('KKF Welterweight Belt 72kg'),
                'event_name' => 'Kun Khmer World Grand Prix 2026',
                'date' => '2026-05-01',
                'opponent' => 'Chea Vibol',
                'opponent_id' => $getFighterId('Chea Vibol'),
                'result' => 'Won',
                'method' => 'Decision',
                'round' => 5,
            ]
        ];
        DB::table('champion_defenses')->insert($defenses);
    }
}
