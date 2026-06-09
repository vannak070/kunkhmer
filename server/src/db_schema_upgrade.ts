import { query } from "./config/db";

async function upgrade() {
  try {
    console.log("Upgrading database schema...");

    // 0. Alter fighters table
    await query(`
      ALTER TABLE fighters 
      ADD COLUMN IF NOT EXISTS image VARCHAR(1024)
    `);
    console.log("- Fighters table updated with image column.");

    // 1. Alter clubs table
    await query(`
      ALTER TABLE clubs 
      ADD COLUMN IF NOT EXISTS head_coach VARCHAR(255),
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 4.0,
      ADD COLUMN IF NOT EXISTS image VARCHAR(1024)
    `);
    console.log("- Clubs table updated.");

    // 2. Alter events table
    await query(`
      ALTER TABLE events
      ADD COLUMN IF NOT EXISTS end_date DATE,
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS image VARCHAR(1024),
      ADD COLUMN IF NOT EXISTS main_sponsor_id UUID REFERENCES sponsors(id) ON DELETE SET NULL
    `);
    console.log("- Events table updated.");

    // 3. Alter sub_events table
    await query(`
      ALTER TABLE sub_events
      ADD COLUMN IF NOT EXISTS batch_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL
    `);
    await query(`
      ALTER TABLE sub_events ALTER COLUMN status TYPE VARCHAR(50);
    `);
    console.log("- Sub_events table updated.");

    // 4. Alter matches table
    await query(`
      ALTER TABLE matches
      ADD COLUMN IF NOT EXISTS referee_id UUID REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS judge_ids UUID[],
      ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES fighters(id) ON DELETE SET NULL
    `);
    console.log("- Matches table updated.");

    // 5. Create champion_type enum
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'champion_type') THEN
          CREATE TYPE champion_type AS ENUM (
            'KKF National', 'ISKA Cambodia', 'IPCC International', 'International Belt', 
            'Interim Belt', 'Super Fight Belt', 'Sponsor Belt', 'Trophy', 
            'Tournament Winner', 'Honorary Award'
          );
        END IF;
      END$$;
    `);
    console.log("- Enum champion_type created.");

    // 6. Create champion_status enum
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'champion_status') THEN
          CREATE TYPE champion_status AS ENUM (
            'Active', 'Title Defense Scheduled', 'Inactive', 'Vacant'
          );
        END IF;
      END$$;
    `);
    console.log("- Enum champion_status created.");

    // 7. Create champions table
    await query(`
      CREATE TABLE IF NOT EXISTS champions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title_name VARCHAR(255) NOT NULL,
          champion_type champion_type NOT NULL,
          weight_class DECIMAL(5,2) NOT NULL,
          organization VARCHAR(100) NOT NULL DEFAULT 'KKF',
          batch_id VARCHAR(100),
          event_name VARCHAR(255),
          current_holder_id UUID REFERENCES fighters(id) ON DELETE SET NULL,
          current_holder_name VARCHAR(255),
          nationality VARCHAR(100),
          date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          date_awarded TIMESTAMP WITH TIME ZONE,
          winning_match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
          status champion_status NOT NULL DEFAULT 'Vacant',
          defense_count INT DEFAULT 0,
          last_defense_date DATE,
          next_defense_deadline DATE,
          belt_image_url VARCHAR(1024),
          trophy_image_url VARCHAR(1024),
          certificate_url VARCHAR(1024),
          notes TEXT,
          approval_status VARCHAR(50) DEFAULT 'approved',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("- Champions table created.");

    // 8. Create champion_defenses table
    await query(`
      CREATE TABLE IF NOT EXISTS champion_defenses (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          champion_id UUID NOT NULL REFERENCES champions(id) ON DELETE CASCADE,
          event_id UUID REFERENCES events(id) ON DELETE SET NULL,
          event_name VARCHAR(255) NOT NULL,
          match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
          date DATE NOT NULL,
          opponent VARCHAR(255) NOT NULL,
          opponent_id UUID REFERENCES fighters(id) ON DELETE SET NULL,
          result VARCHAR(50) NOT NULL,
          method VARCHAR(100),
          round INT
      );
    `);
    // 9. Alter sponsors table
    await query(`
      ALTER TABLE sponsors
      ADD COLUMN IF NOT EXISTS industry VARCHAR(255),
      ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'Gold',
      ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255),
      ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS website_url VARCHAR(1024)
    `);
    console.log("- Sponsors table updated with extra fields.");

    // 10. Alter broadcast_stations table
    await query(`
      ALTER TABLE broadcast_stations
      ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT 'Cable TV',
      ADD COLUMN IF NOT EXISTS reach VARCHAR(100) DEFAULT 'National',
      ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255),
      ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS website_url VARCHAR(1024),
      ADD COLUMN IF NOT EXISTS logo_url VARCHAR(1024)
    `);
    console.log("- Broadcast_stations table updated with extra fields.");

    console.log("Database schema upgrade complete!");
  } catch (err) {
    console.error("Error upgrading schema:", err);
  }
  process.exit(0);
}

upgrade();
