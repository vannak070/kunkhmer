import { query } from "../config/db";

export interface FighterInput {
  name: string;
  nameKhmer: string;
  alias?: string;
  dateOfBirth: string;
  nationality?: string;
  province?: string;
  gender: 'Male' | 'Female';
  currentWeight: number;
  height: number;
  clubId?: string | null;
  style?: string;
  grade?: 'A' | 'B' | 'C' | 'D';
  image?: string;
}

export class FighterService {
  static async getAll(status?: string, clubId?: string) {
    let sql = `
      SELECT f.*, c.name as club_name 
      FROM fighters f 
      LEFT JOIN clubs c ON f.club_id = c.id 
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (status) {
      params.push(status);
      sql += ` AND f.status = $${params.length}`;
    }
    
    if (clubId) {
      params.push(clubId);
      sql += ` AND f.club_id = $${params.length}`;
    }
    
    sql += " ORDER BY f.created_at DESC";
    
    const result = await query(sql, params);
    return result.rows;
  }

  static async getById(id: string) {
    const result = await query(`
      SELECT f.*, c.name as club_name 
      FROM fighters f 
      LEFT JOIN clubs c ON f.club_id = c.id 
      WHERE f.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async create(input: FighterInput) {
    const sql = `
      INSERT INTO fighters (
        name, name_khmer, alias, date_of_birth, nationality, province, 
        gender, current_weight, height, club_id, style, grade, status, image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Draft', $13)
      RETURNING *
    `;
    const params = [
      input.name, input.nameKhmer, input.alias || null, input.dateOfBirth,
      input.nationality || 'Cambodian', input.province || null, input.gender,
      input.currentWeight, input.height, input.clubId || null, input.style || null,
      input.grade || 'D', input.image || null
    ];
    
    const result = await query(sql, params);
    return result.rows[0];
  }

  static async update(id: string, input: Partial<FighterInput>) {
    // Dynamic update query builder
    const keys = Object.keys(input);
    if (keys.length === 0) return this.getById(id);

    const setClauses: string[] = [];
    const params: any[] = [id];

    keys.forEach((key, index) => {
      // Map camelCase to snake_case for PostgreSQL
      const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      params.push((input as any)[key]);
      setClauses.push(`${dbKey} = $${index + 2}`);
    });

    const sql = `
      UPDATE fighters 
      SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, params);
    return result.rows[0] || null;
  }

  static async verify(id: string, verifiedBy: string) {
    const sql = `
      UPDATE fighters 
      SET status = 'Active', verified_by = $2, verified_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, verifiedBy]);
    return result.rows[0] || null;
  }

  static async delete(id: string) {
    const result = await query("DELETE FROM fighters WHERE id = $1 RETURNING *", [id]);
    return result.rows[0] || null;
  }
}
