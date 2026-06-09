"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
async function seed() {
    try {
        console.log("Seeding database with initial data...");
        // Clear existing data (in reverse order of dependencies)
        await (0, db_1.query)("TRUNCATE TABLE champion_defenses CASCADE");
        await (0, db_1.query)("TRUNCATE TABLE champions CASCADE");
        await (0, db_1.query)("TRUNCATE TABLE bout_results CASCADE");
        await (0, db_1.query)("TRUNCATE TABLE matches CASCADE");
        await (0, db_1.query)("TRUNCATE TABLE sub_events CASCADE");
        await (0, db_1.query)("TRUNCATE TABLE event_sponsors CASCADE");
        await (0, db_1.query)("TRUNCATE TABLE events CASCADE");
        await (0, db_1.query)("TRUNCATE TABLE sponsors CASCADE");
        await (0, db_1.query)("TRUNCATE TABLE broadcast_stations CASCADE");
        await (0, db_1.query)("TRUNCATE TABLE users CASCADE");
        await (0, db_1.query)("TRUNCATE TABLE fighters CASCADE");
        await (0, db_1.query)("TRUNCATE TABLE clubs CASCADE");
        console.log("- Existing database tables cleared.");
        // 1. Seed Clubs
        const clubsResult = await (0, db_1.query)(`
      INSERT INTO clubs (name, name_khmer, location, head_coach, status, rating, image)
      VALUES 
        ('Phnom Penh Top Team', 'ភ្នំពេញ ថប ធីម', 'Phnom Penh, Cambodia', 'Chan Reach', 'active', 4.8, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2940&auto=format&fit=crop'),
        ('Siem Reap Warriors', 'សៀមរាប វ៉ររៀរ', 'Siem Reap, Cambodia', 'Sok Rith', 'active', 4.5, 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=2940&auto=format&fit=crop'),
        ('Battambang Strikers', 'បាត់ដំបង ស្ទ្រីតឃើ', 'Battambang, Cambodia', 'Meas Chanta', 'inactive', 4.2, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2940&auto=format&fit=crop'),
        ('Kampot Fight Club', 'កំពត ហ្វាយ ខ្លឹប', 'Kampot, Cambodia', 'Heng Virak', 'active', 4.3, 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=2940&auto=format&fit=crop'),
        ('Angkor Elite Academy', 'អង្គរ អេលីត អាខាដេមី', 'Siem Reap, Cambodia', 'Keo Vy', 'active', 4.7, 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?q=80&w=2940&auto=format&fit=crop')
      RETURNING id, name
    `);
        const clubs = clubsResult.rows;
        console.log("- Clubs seeded.");
        const getClubId = (name) => clubs.find(c => c.name === name)?.id || null;
        // 2. Seed Users
        const usersResult = await (0, db_1.query)(`
      INSERT INTO users (username, full_name, email, password_hash, role, status, club_id)
      VALUES 
        ('superadmin', 'System Administrator', 'superadmin@kkf.gov.kh', 'admin123', 'Super Admin', 'Active', NULL),
        ('officer1', 'Sreymom Keo', 'officer@kkf.gov.kh', 'officer123', 'KKF Officer', 'Active', NULL),
        ('organizer', 'Town Full HDTV', 'events@townfullhdtv.com', 'org123', 'Organizer', 'Active', NULL),
        ('manager', 'Chey Rithy', 'manager@kkf.gov.kh', 'man123', 'KKF Officer', 'Active', NULL),
        ('club_kiry', 'Kiry Sak', 'kiry@gym.com', 'club123', 'Club/Gym', 'Active', $1)
      RETURNING id, username
    `, [getClubId('Phnom Penh Top Team')]);
        const users = usersResult.rows;
        console.log("- Users seeded.");
        const getUserId = (username) => users.find(u => u.username === username)?.id || null;
        // 3. Seed Fighters
        const fightersResult = await (0, db_1.query)(`
      INSERT INTO fighters (name, name_khmer, alias, date_of_birth, nationality, province, gender, current_weight, height, club_id, record, grade, status, professional_status, image)
      VALUES
        ('Sorn Seavmey', 'សន សៀវម៉ី', 'The Tiger', '1995-09-14', 'Cambodian', 'Phnom Penh', 'Female', 65.8, 1.83, $1, '34-5-2', 'A', 'Active', 'Professional', 'https://images.unsplash.com/photo-1636581563815-9c40c35abe0b?auto=format&fit=crop&q=80&w=600'),
        ('Chan Rothana', 'ចាន់ រតនា', 'Dragon', '1986-07-01', 'Cambodian', 'Phnom Penh', 'Male', 61.2, 1.72, $2, '28-8-0', 'A', 'Active', 'Professional', 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=600'),
        ('Nou Srey Pov', 'នូ ស្រីពៅ', 'Iron Hands', '1998-10-20', 'Cambodian', 'Battambang', 'Female', 52.2, 1.58, $3, '19-3-1', 'B', 'Active', 'Professional', 'https://images.unsplash.com/photo-1602827115160-a9e732f05533?auto=format&fit=crop&q=80&w=600'),
        ('Prak Sophea', 'ប្រាក់ សុភ័ក្រ', 'The Elbow King', '1993-04-12', 'Cambodian', 'Phnom Penh', 'Male', 57.5, 1.68, $1, '42-7-1', 'A', 'Active', 'Professional', 'https://images.unsplash.com/photo-1601039834001-7d32a613c60d?auto=format&fit=crop&q=80&w=600'),
        ('Kem Sitha', 'កឹម ស៊ីថា', 'Thunder Kick', '1997-02-18', 'Cambodian', 'Siem Reap', 'Male', 63.2, 1.70, $2, '31-12-3', 'B', 'Active', 'Professional', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600'),
        ('Chea Vibol', 'ជា វិបុល', 'The Phantom', '1996-11-22', 'Cambodian', 'Battambang', 'Male', 68.0, 1.75, $3, '25-15-2', 'B', 'Active', 'Professional', 'https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&q=80&w=600'),
        ('Sam Phirun', 'សំ ភិរុណ', 'Golden Gloves', '1994-08-05', 'Cambodian', 'Battambang', 'Male', 54.3, 1.65, $3, '39-9-2', 'A', 'Active', 'Professional', 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=600'),
        ('Lao Chetra', 'ឡៅ ចិត្រា', 'The Iron Fist', '1999-05-10', 'Cambodian', 'Kampong Speu', 'Male', 63.5, 1.71, $1, '58-8-3', 'A', 'Active', 'Professional', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=600'),
        ('Falcon', 'ហ្វាល់ខន', 'The Winged Falcon', '2001-01-01', 'French', 'Siem Reap', 'Male', 63.5, 1.76, $2, '12-4-0', 'B', 'Active', 'Professional', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=600'),
        ('Sok Thy', 'សុក ធី', 'The Kick Machine', '1997-12-05', 'Cambodian', 'Siem Reap', 'Male', 60.0, 1.68, $2, '120-22-5', 'A', 'Active', 'Professional', 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=600'),
        ('Khun Dima', 'ឃុន ឌីម៉ា', 'Elbow Specialist', '1994-05-15', 'Cambodian', 'Kampot', 'Male', 63.5, 1.72, $4, '85-15-4', 'A', 'Active', 'Professional', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600'),
        ('Keo Rumchong', 'កែវ រំចង់', 'The Iron Man', '1989-01-01', 'Cambodian', 'Battambang', 'Male', 70.0, 1.70, $3, '145-30-6', 'A', 'Active', 'Professional', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=600'),
        ('Srey Chanthy', 'ស្រី ចាន់ធី', 'Golden Queen', '2000-03-01', 'Cambodian', 'Siem Reap', 'Female', 54.0, 1.60, $5, '22-3-1', 'B', 'Active', 'Professional', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600'),
        ('Lao Chandra', 'ឡៅ ចន្ទ្រា', 'Knee Destroyer', '1998-07-20', 'Cambodian', 'Kampong Speu', 'Male', 65.0, 1.73, $1, '64-10-2', 'A', 'Active', 'Professional', 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=600'),
        ('Thoeun Theara', 'ធឿន ធារ៉ា', 'The King of Kun Khmer', '1998-02-10', 'Cambodian', 'Prey Veng', 'Male', 72.0, 1.78, $4, '72-5-3', 'A', 'Active', 'Professional', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600')
      RETURNING id, name
    `, [
            getClubId('Phnom Penh Top Team'), // $1
            getClubId('Siem Reap Warriors'), // $2
            getClubId('Battambang Strikers'), // $3
            getClubId('Kampot Fight Club'), // $4
            getClubId('Angkor Elite Academy') // $5
        ]);
        const fighters = fightersResult.rows;
        console.log("- Fighters seeded.");
        const getFighterId = (name) => fighters.find(f => f.name === name)?.id || null;
        // 4. Seed Sponsors
        const sponsorsResult = await (0, db_1.query)(`
      INSERT INTO sponsors (name, logo_url)
      VALUES 
        ('Ganberg Beer', '🍺'),
        ('Boost Strong', '⚡'),
        ('Smart Axiata', '🟢'),
        ('Cellcard', '🟠')
      RETURNING id, name
    `);
        const sponsors = sponsorsResult.rows;
        console.log("- Sponsors seeded.");
        // 5. Seed Broadcast Stations
        const broadcastResult = await (0, db_1.query)(`
      INSERT INTO broadcast_stations (name, stream_url)
      VALUES 
        ('Town Full HDTV', 'https://stream.townfullhdtv.com/live'),
        ('Bayon TV', 'https://stream.bayontv.com/live'),
        ('PNN', 'https://stream.pnn.com/live'),
        ('CTN', 'https://stream.ctn.com/live')
      RETURNING id, name
    `);
        const broadcastStations = broadcastResult.rows;
        console.log("- Broadcast stations seeded.");
        const getStationId = (name) => broadcastStations.find(s => s.name === name)?.id || null;
        // 6. Seed Events
        const eventsResult = await (0, db_1.query)(`
      INSERT INTO events (name, date, location, status, organizer_id, broadcast_station_id, description, image)
      VALUES 
        ('Kun Khmer National Championship 2026', '2026-06-15', 'Olympic Stadium Arena, Phnom Penh', 'Published', $1, $2, 'The premier national league tournament of the year, bringing together Cambodia top gyms.', 'https://images.unsplash.com/photo-1574629810360-7efbc5eca0aa?auto=format&fit=crop&q=80&w=1200'),
        ('Siem Reap Fight Night', '2026-07-20', 'Siem Reap Boxing Stadium', 'Draft', $1, $3, 'A classic weekend fight card showcasing regional talents in Siem Reap.', 'https://images.unsplash.com/photo-1601039834001-7d32a613c60d?auto=format&fit=crop&q=80&w=1200'),
        ('Kun Khmer World Grand Prix 2026', '2026-08-10', 'Olympic Stadium Indoor Arena, Phnom Penh', 'Published', $1, $3, 'Top tier international event featuring the best fighters from around the globe.', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200'),
        ('Kampot King of the Ring', '2026-09-05', 'Kampot Boxing Stadium', 'Draft', $1, $2, 'A spectacular coastal championship event.', 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=1200')
      RETURNING id, name
    `, [getUserId('organizer'), getStationId('Town Full HDTV'), getStationId('Bayon TV')]);
        const events = eventsResult.rows;
        console.log("- Events seeded.");
        const getEventId = (name) => events.find(e => e.name === name)?.id || null;
        // 7. Seed Event Sponsors
        await (0, db_1.query)(`
      INSERT INTO event_sponsors (event_id, sponsor_id)
      VALUES 
        ($1, $2),
        ($1, $3)
    `, [getEventId('Kun Khmer National Championship 2026'), sponsors[0].id, sponsors[1].id]);
        console.log("- Event sponsors seeded.");
        // 8. Seed SubEvents (Batches)
        const subEventsResult = await (0, db_1.query)(`
      INSERT INTO sub_events (id, event_id, name, week_number, date, location, phase, status, batch_number, created_by)
      VALUES 
        ('e0c5fc5f-9323-4ac0-8035-a2f8848fe8a4', $1, 'Week 1 Fight Card', 1, '2026-06-15', 'Olympic Stadium Arena, Phnom Penh', 'Qualifier', 'Scheduled', 'BATCH-001', $2),
        ('298ce981-ec05-4c44-adce-0225c0f93044', $1, 'Week 2 Fight Card', 2, '2026-06-22', 'Olympic Stadium Arena, Phnom Penh', 'Qualifier', 'Scheduled', 'BATCH-002', $2)
      RETURNING id, name
    `, [getEventId('Kun Khmer National Championship 2026'), getUserId('officer1')]);
        const subEvents = subEventsResult.rows;
        console.log("- Sub events (batches) seeded.");
        const getSubEventId = (name) => subEvents.find(s => s.name === name)?.id || null;
        const fSeavmey = getFighterId('Sorn Seavmey');
        const fRothana = getFighterId('Chan Rothana');
        const fSreyPov = getFighterId('Nou Srey Pov');
        const fSophea = getFighterId('Prak Sophea');
        const fSitha = getFighterId('Kem Sitha');
        const fVibol = getFighterId('Chea Vibol');
        const fPhirun = getFighterId('Sam Phirun');
        const fChetra = getFighterId('Lao Chetra');
        const fFalcon = getFighterId('Falcon');
        const fThy = getFighterId('Sok Thy');
        const fDima = getFighterId('Khun Dima');
        const fRumchong = getFighterId('Keo Rumchong');
        const fChanthy = getFighterId('Srey Chanthy');
        const fChandra = getFighterId('Lao Chandra');
        const fTheara = getFighterId('Thoeun Theara');
        const evNational = getEventId('Kun Khmer National Championship 2026');
        const subWeek1 = getSubEventId('Week 1 Fight Card');
        const subWeek2 = getSubEventId('Week 2 Fight Card');
        const uOfficer = getUserId('officer1');
        // 9. Seed Matches
        await (0, db_1.query)(`
      INSERT INTO matches (event_id, sub_event_id, fighter_a_id, fighter_b_id, rounds, round_time, knockdown_limit, agreed_weight, glove_size, glove_brand, status, proposal_status, club_a_response, club_b_response, referee_id)
      VALUES 
        -- Week 1 Matches
        ($1, $2, $3, $4, 3, 3, 3, 63.5, '8oz', 'FBT', 'Ready to Fight', 'accepted', 'accepted', 'accepted', $5),
        ($1, $2, $6, $7, 5, 3, 3, 65.0, '10oz', 'Twins', 'Draft', 'draft', 'pending', 'pending', NULL),
        ($1, $2, $8, $9, 3, 3, 3, 57.5, '8oz', 'FBT', 'Ready to Fight', 'accepted', 'accepted', 'accepted', $5),
        ($1, $2, $10, $11, 3, 3, 3, 54.3, '8oz', 'Twins', 'Draft', 'draft', 'pending', 'pending', NULL),
        ($1, $2, $12, $13, 5, 3, 3, 72.0, '10oz', 'FBT', 'Club Confirmed', 'accepted', 'accepted', 'accepted', $5),

        -- Week 2 Matches
        ($1, $14, $15, $4, 3, 3, 3, 60.0, '8oz', 'Twins', 'Ready to Fight', 'accepted', 'accepted', 'accepted', $5),
        ($1, $14, $16, $3, 3, 3, 3, 63.5, '8oz', 'FBT', 'Pending Club Confirmation', 'pending', 'accepted', 'pending', NULL),
        ($1, $14, $17, $7, 5, 3, 3, 70.0, '10oz', 'Twins', 'Draft', 'draft', 'pending', 'pending', NULL),
        ($1, $14, $18, $13, 5, 3, 3, 72.0, '10oz', 'FBT', 'Ready to Fight', 'accepted', 'accepted', 'accepted', $5)
    `, [
            evNational, // $1
            subWeek1, // $2
            fChetra, // $3
            fFalcon, // $4
            uOfficer, // $5
            fSeavmey, // $6
            fRothana, // $7
            fSophea, // $8
            fSitha, // $9
            fPhirun, // $10
            fSreyPov, // $11
            fTheara, // $12
            fVibol, // $13
            subWeek2, // $14
            fThy, // $15
            fDima, // $16
            fRumchong, // $17
            fChandra // $18
        ]);
        console.log("- Matches seeded.");
        // 10. Seed Champions
        const championsResult = await (0, db_1.query)(`
      INSERT INTO champions (title_name, champion_type, weight_class, organization, batch_id, event_name, current_holder_id, current_holder_name, nationality, status, defense_count, notes)
      VALUES 
        ('KKF National Champion 70kg', 'KKF National', 70, 'KKF', 'BATCH-001', 'Kun Khmer Championship 2026', $1, 'Sorn Seavmey', 'Cambodian', 'Active', 3, 'Dominant performance in all title defenses'),
        ('ISKA Cambodia Champion 60kg', 'ISKA Cambodia', 60, 'KKF', 'BATCH-002', 'Siem Reap Fight Night', $2, 'Chan Rothana', 'Cambodian', 'Title Defense Scheduled', 2, 'Legendary veteran and champion'),
        ('KKF Welterweight Belt 72kg', 'KKF National', 72, 'KKF', 'BATCH-002', 'Kun Khmer National Championship 2026', $3, 'Thoeun Theara', 'Cambodian', 'Active', 4, 'The reigning undisputed champion'),
        ('Kun Khmer World Belt 60kg', 'IPCC International', 60, 'IPCC', 'BATCH-001', 'Kun Khmer World Grand Prix 2026', $4, 'Sok Thy', 'Cambodian', 'Active', 1, 'Won in an international championship bout'),
        ('Bayon TV Championship Trophy 63.5kg', 'Tournament Winner', 63.5, 'Bayon TV', 'BATCH-002', 'Siem Reap Fight Night', $5, 'Khun Dima', 'Cambodian', 'Active', 0, 'Won the 2025 Bayon TV Tournament')
      RETURNING id, title_name
    `, [fSeavmey, fRothana, fTheara, fThy, fDima]);
        const seededChampions = championsResult.rows;
        console.log("- Champions seeded.");
        const getChampionId = (title) => seededChampions.find(c => c.title_name === title)?.id || null;
        // 11. Seed Champion Defenses
        await (0, db_1.query)(`
      INSERT INTO champion_defenses (champion_id, event_name, date, opponent, opponent_id, result, method, round)
      VALUES 
        -- Seavmey defenses
        ($1, 'Kun Khmer National Championship 2026', '2026-06-15', 'Nou Srey Pov', $2, 'Won', 'Decision', 5),
        ($1, 'Siem Reap Fight Night', '2026-04-10', 'Foreign Challenger', NULL, 'Won', 'KO', 2),

        -- Rothana defenses
        ($3, 'Siem Reap Fight Night', '2026-05-20', 'Kem Sitha', $4, 'Won', 'TKO', 4),

        -- Theara defenses
        ($5, 'Kun Khmer World Grand Prix 2026', '2026-05-01', 'Chea Vibol', $6, 'Won', 'Decision', 5)
    `, [
            getChampionId('KKF National Champion 70kg'), // $1
            fSreyPov, // $2
            getChampionId('ISKA Cambodia Champion 60kg'), // $3
            fSitha, // $4
            getChampionId('KKF Welterweight Belt 72kg'), // $5
            fVibol // $6
        ]);
        console.log("- Champion defenses seeded.");
        console.log("Database seeded successfully!");
    }
    catch (err) {
        console.error("Error seeding database:", err);
    }
    process.exit(0);
}
seed();
