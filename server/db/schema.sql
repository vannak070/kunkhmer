-- Kun Khmer Management System
-- PostgreSQL Database Schema Design

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE fighter_grade AS ENUM ('A', 'B', 'C', 'D');
CREATE TYPE fighter_status AS ENUM ('Draft', 'Pending KKF Verification', 'Active', 'Suspended', 'Inactive', 'Retired', 'Banned');
CREATE TYPE event_status AS ENUM ('Draft', 'Pending KKF Approval', 'KKF Approved', 'Building Fight Card', 'Pending Publication', 'Published', 'Pre-Event Checks', 'In Progress', 'Scoring Complete', 'Under Review', 'Closed');
CREATE TYPE sub_event_phase AS ENUM ('Qualifier', 'Semi-Final', 'Final');
CREATE TYPE sub_event_status AS ENUM ('Scheduled', 'In Progress', 'Completed');
CREATE TYPE match_status AS ENUM ('Draft', 'Proposed', 'Pending Club Confirmation', 'Club Confirmed', 'Ready to Fight', 'In Progress', 'Completed');
CREATE TYPE match_proposal_status AS ENUM ('draft', 'pending', 'accepted', 'rejected');
CREATE TYPE club_response AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE bout_method AS ENUM ('KO', 'TKO', 'Decision', 'Submission', 'Draw', 'No Contest');
CREATE TYPE award_category AS ENUM ('Individual', 'Team', 'Special');
CREATE TYPE award_status AS ENUM ('Active', 'Retired', 'Upcoming');
CREATE TYPE user_role AS ENUM ('Super Admin', 'KKF Officer', 'Organizer', 'Club/Gym', 'Viewer/Fan');

-- 1. CLUBS / GYMS Table
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_khmer VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'Viewer/Fan',
    status VARCHAR(50) DEFAULT 'Active',
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. FIGHTERS Table
CREATE TABLE fighters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_khmer VARCHAR(255) NOT NULL,
    alias VARCHAR(255),
    date_of_birth DATE NOT NULL,
    nationality VARCHAR(100) NOT NULL DEFAULT 'Cambodian',
    province VARCHAR(100),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    current_weight DECIMAL(5,2) NOT NULL CHECK (current_weight > 0),
    height DECIMAL(5,2) NOT NULL CHECK (height > 0),
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    image VARCHAR(1024),
    style VARCHAR(100),
    record VARCHAR(50), -- formatted "W-L-D"
    grade fighter_grade NOT NULL DEFAULT 'D',
    status fighter_status NOT NULL DEFAULT 'Draft',
    professional_status VARCHAR(50) DEFAULT 'Professional',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BROADCAST STATIONS Table
CREATE TABLE broadcast_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    stream_url VARCHAR(1024),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SPONSORS Table
CREATE TABLE sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(1024),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. EVENTS Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    status event_status NOT NULL DEFAULT 'Draft',
    organizer_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    broadcast_station_id UUID REFERENCES broadcast_stations(id) ON DELETE SET NULL,
    kkf_approval_date TIMESTAMP WITH TIME ZONE,
    kkf_approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. EVENT_SPONSORS Junction Table (Many-to-Many)
CREATE TABLE event_sponsors (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, sponsor_id)
);

-- 8. SUB_EVENTS (Weekly Fight Cards / Tournament Phases) Table
CREATE TABLE sub_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    week_number INT NOT NULL CHECK (week_number > 0),
    date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    phase sub_event_phase NOT NULL DEFAULT 'Qualifier',
    status sub_event_status NOT NULL DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. MATCHES Table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    sub_event_id UUID NOT NULL REFERENCES sub_events(id) ON DELETE CASCADE,
    fighter_a_id UUID NOT NULL REFERENCES fighters(id) ON DELETE RESTRICT,
    fighter_b_id UUID NOT NULL REFERENCES fighters(id) ON DELETE RESTRICT,
    rounds INT NOT NULL CHECK (rounds IN (3, 5)),
    round_time INT NOT NULL CHECK (round_time IN (2, 3, 5)), -- in minutes
    knockdown_limit INT NOT NULL CHECK (knockdown_limit > 0),
    agreed_weight DECIMAL(5,2) NOT NULL CHECK (agreed_weight > 0),
    
    -- Glove Agreement Columns
    glove_size VARCHAR(10) NOT NULL CHECK (glove_size IN ('6oz', '8oz', '10oz')),
    glove_brand VARCHAR(100) NOT NULL,
    fighter_a_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    fighter_b_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    referee_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    glove_confirmed_date TIMESTAMP WITH TIME ZONE,

    -- Match & Proposal Status
    status match_status NOT NULL DEFAULT 'Draft',
    proposal_status match_proposal_status NOT NULL DEFAULT 'draft',
    club_a_response club_response NOT NULL DEFAULT 'pending',
    club_b_response club_response NOT NULL DEFAULT 'pending',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent booking a fighter against themselves
    CONSTRAINT check_different_fighters CHECK (fighter_a_id <> fighter_b_id)
);

-- 10. BOUT_RESULTS Table
CREATE TABLE bout_results (
    match_id UUID PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
    winner_id UUID REFERENCES fighters(id) ON DELETE SET NULL, -- NULL represents a Draw or No Contest
    method bout_method NOT NULL,
    round INT NOT NULL,
    duration VARCHAR(50), -- e.g., "1:45"
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. AWARDS Table (Belts and Championships)
CREATE TABLE awards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category award_category NOT NULL,
    status award_status NOT NULL DEFAULT 'Upcoming',
    current_holder_fighter_id UUID REFERENCES fighters(id) ON DELETE SET NULL,
    current_holder_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    date_awarded DATE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    eligibility_criteria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_single_holder_type CHECK (
        (current_holder_fighter_id IS NULL AND current_holder_club_id IS NOT NULL) OR
        (current_holder_fighter_id IS NOT NULL AND current_holder_club_id IS NULL) OR
        (current_holder_fighter_id IS NULL AND current_holder_club_id IS NULL)
    )
);

-- 12. AWARD_HISTORY Table
CREATE TABLE award_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    award_id UUID NOT NULL REFERENCES awards(id) ON DELETE CASCADE,
    holder_fighter_id UUID REFERENCES fighters(id) ON DELETE SET NULL,
    holder_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    defended_times INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_single_history_holder_type CHECK (
        (holder_fighter_id IS NULL AND holder_club_id IS NOT NULL) OR
        (holder_fighter_id IS NOT NULL AND holder_club_id IS NULL)
    )
);

-- Add database indices for query optimization
CREATE INDEX idx_fighters_club ON fighters(club_id);
CREATE INDEX idx_fighters_status ON fighters(status);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_matches_sub_event ON matches(sub_event_id);
CREATE INDEX idx_matches_fighters ON matches(fighter_a_id, fighter_b_id);
