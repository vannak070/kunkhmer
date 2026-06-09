import { query } from "../config/db";

export interface SubEventInput {
  eventId: string;
  name: string;
  weekNumber: number;
  date: string;
  location: string;
  phase?: string;
  status?: string;
  batchNumber?: string;
}

export interface MatchInput {
  eventId: string;
  subEventId: string; // maps to batchId
  fighterAId: string;
  fighterBId: string;
  rounds: number;
  roundTime: number;
  knockdownLimit: number;
  agreedWeight: number;
  gloveSize: string;
  gloveBrand: string;
  status?: string;
  proposalStatus?: string;
  clubAResponse?: string;
  clubBResponse?: string;
  refereeId?: string | null;
  judgeIds?: string[];
}

export interface ResultInput {
  winnerId?: string | null;
  method: string;
  round: number;
  duration?: string;
}

export class MatchService {
  // --- SUB EVENTS / BATCHES ---
  static async getAllSubEvents() {
    const result = await query(`
      SELECT s.*, e.name as event_name, u.full_name as creator_name
      FROM sub_events s
      LEFT JOIN events e ON s.event_id = e.id
      LEFT JOIN users u ON s.created_by = u.id
      ORDER BY s.date DESC, s.created_at DESC
    `);
    return result.rows;
  }

  static async getSubEventById(id: string) {
    const result = await query(`
      SELECT s.*, e.name as event_name, u.full_name as creator_name
      FROM sub_events s
      LEFT JOIN events e ON s.event_id = e.id
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async createSubEvent(input: SubEventInput, createdBy: string) {
    const sql = `
      INSERT INTO sub_events (event_id, name, week_number, date, location, phase, status, batch_number, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [
      input.eventId,
      input.name,
      input.weekNumber,
      input.date,
      input.location,
      input.phase || "Qualifier",
      input.status || "Draft",
      input.batchNumber || `BATCH-${Date.now()}`,
      createdBy
    ];
    const result = await query(sql, params);
    return result.rows[0];
  }

  static async updateSubEvent(id: string, input: Partial<SubEventInput>) {
    const keys = Object.keys(input);
    if (keys.length === 0) return this.getSubEventById(id);

    const setClauses: string[] = [];
    const params: any[] = [id];

    keys.forEach((key, index) => {
      const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      params.push((input as any)[key]);
      setClauses.push(`${dbKey} = $${index + 2}`);
    });

    const sql = `
      UPDATE sub_events 
      SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, params);
    return result.rows[0] || null;
  }

  static async deleteSubEvent(id: string) {
    const result = await query("DELETE FROM sub_events WHERE id = $1 RETURNING *", [id]);
    return result.rows[0] || null;
  }

  // --- MATCHES ---
  static async getMatches(subEventId?: string) {
    let sql = `
      SELECT m.*, 
             s.date as date, s.name as sub_event_name,
             fa.name as fighter_a_name, fa.image as fighter_a_image, fa.record as fighter_a_record, fa.grade as fighter_a_grade,
             fb.name as fighter_b_name, fb.image as fighter_b_image, fb.record as fighter_b_record, fb.grade as fighter_b_grade,
             ca.name as club_a_name, cb.name as club_b_name,
             r.full_name as referee_name,
             br.winner_id, br.method as winner_method, br.round as winner_round, br.duration as winner_duration
      FROM matches m
      JOIN sub_events s ON m.sub_event_id = s.id
      JOIN fighters fa ON m.fighter_a_id = fa.id
      JOIN fighters fb ON m.fighter_b_id = fb.id
      LEFT JOIN clubs ca ON fa.club_id = ca.id
      LEFT JOIN clubs cb ON fb.club_id = cb.id
      LEFT JOIN users r ON m.referee_id = r.id
      LEFT JOIN bout_results br ON m.id = br.match_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (subEventId) {
      params.push(subEventId);
      sql += ` AND m.sub_event_id = $1`;
    }
    sql += " ORDER BY m.created_at ASC";

    const result = await query(sql, params);
    return result.rows;
  }

  static async getMatchById(id: string) {
    const result = await query(`
      SELECT m.*, 
             s.date as date, s.name as sub_event_name,
             fa.name as fighter_a_name, fa.image as fighter_a_image, fa.record as fighter_a_record, fa.grade as fighter_a_grade,
             fb.name as fighter_b_name, fb.image as fighter_b_image, fb.record as fighter_b_record, fb.grade as fighter_b_grade,
             ca.name as club_a_name, cb.name as club_b_name,
             r.full_name as referee_name,
             br.winner_id, br.method as winner_method, br.round as winner_round, br.duration as winner_duration
      FROM matches m
      JOIN sub_events s ON m.sub_event_id = s.id
      JOIN fighters fa ON m.fighter_a_id = fa.id
      JOIN fighters fb ON m.fighter_b_id = fb.id
      LEFT JOIN clubs ca ON fa.club_id = ca.id
      LEFT JOIN clubs cb ON fb.club_id = cb.id
      LEFT JOIN users r ON m.referee_id = r.id
      LEFT JOIN bout_results br ON m.id = br.match_id
      WHERE m.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async createMatch(input: MatchInput) {
    const sql = `
      INSERT INTO matches (
        event_id, sub_event_id, fighter_a_id, fighter_b_id, rounds, round_time, 
        knockdown_limit, agreed_weight, glove_size, glove_brand, status, proposal_status,
        club_a_response, club_b_response, referee_id, judge_ids
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    const params = [
      input.eventId,
      input.subEventId,
      input.fighterAId,
      input.fighterBId,
      input.rounds,
      input.roundTime,
      input.knockdownLimit,
      input.agreedWeight,
      input.gloveSize,
      input.gloveBrand,
      input.status || "Draft",
      input.proposalStatus || "draft",
      input.clubAResponse || "pending",
      input.clubBResponse || "pending",
      input.refereeId || null,
      input.judgeIds || null
    ];
    const result = await query(sql, params);
    return this.getMatchById(result.rows[0].id);
  }

  static async updateMatch(id: string, input: Partial<MatchInput>) {
    const keys = Object.keys(input);
    if (keys.length === 0) return this.getMatchById(id);

    const setClauses: string[] = [];
    const params: any[] = [id];

    keys.forEach((key, index) => {
      const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      params.push((input as any)[key]);
      setClauses.push(`${dbKey} = $${index + 2}`);
    });

    const sql = `
      UPDATE matches 
      SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    await query(sql, params);
    return this.getMatchById(id);
  }

  static async deleteMatch(id: string) {
    const result = await query("DELETE FROM matches WHERE id = $1 RETURNING *", [id]);
    return result.rows[0] || null;
  }

  // --- BOUT RESULTS ---
  static async setMatchResult(matchId: string, input: ResultInput) {
    // Upsert bout result
    await query(`
      INSERT INTO bout_results (match_id, winner_id, method, round, duration)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (match_id) DO UPDATE 
      SET winner_id = EXCLUDED.winner_id, 
          method = EXCLUDED.method, 
          round = EXCLUDED.round, 
          duration = EXCLUDED.duration,
          recorded_at = CURRENT_TIMESTAMP
    `, [matchId, input.winnerId || null, input.method, input.round, input.duration || null]);

    // Update match status to Completed
    await query("UPDATE matches SET status = 'Completed' WHERE id = $1", [matchId]);

    // Recalculate records for both fighters
    const match = await this.getMatchById(matchId);
    if (match) {
      await this.recalculateFighterRecord(match.fighter_a_id);
      await this.recalculateFighterRecord(match.fighter_b_id);
    }

    return this.getMatchById(matchId);
  }

  static async recalculateFighterRecord(fighterId: string) {
    // Retrieve all completed matches for this fighter
    const matchesResult = await query(`
      SELECT m.id, br.winner_id, br.method
      FROM matches m
      JOIN bout_results br ON m.id = br.match_id
      WHERE (m.fighter_a_id = $1 OR m.fighter_b_id = $1) AND m.status = 'Completed'
    `, [fighterId]);

    let wins = 0;
    let losses = 0;
    let draws = 0;

    matchesResult.rows.forEach(m => {
      if (m.winner_id === fighterId) {
        wins++;
      } else if (m.winner_id === null) {
        draws++;
      } else {
        losses++;
      }
    });

    const recordString = `${wins}-${losses}-${draws}`;
    await query("UPDATE fighters SET record = $1 WHERE id = $2", [recordString, fighterId]);
  }
}
