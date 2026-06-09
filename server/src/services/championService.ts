import { query } from "../config/db";

export interface ChampionInput {
  titleName: string;
  championType: string;
  weightClass: number;
  organization?: string;
  batchId?: string | null;
  eventName?: string | null;
  currentHolderId?: string | null;
  currentHolderName?: string | null;
  nationality?: string | null;
  status?: string;
  defenseCount?: number;
  lastDefenseDate?: string | null;
  nextDefenseDeadline?: string | null;
  beltImageUrl?: string | null;
  trophyImageUrl?: string | null;
  certificateUrl?: string | null;
  notes?: string | null;
  approvalStatus?: string;
}

export class ChampionService {
  static async getAll() {
    const result = await query(`
      SELECT c.*, f.name as current_holder_name_db, f.image as current_holder_photo_db, f.nationality as current_holder_nationality_db
      FROM champions c
      LEFT JOIN fighters f ON c.current_holder_id = f.id
      ORDER BY c.created_at DESC
    `);
    return result.rows;
  }

  static async getById(id: string) {
    const result = await query(`
      SELECT c.*, f.name as current_holder_name_db, f.image as current_holder_photo_db, f.nationality as current_holder_nationality_db
      FROM champions c
      LEFT JOIN fighters f ON c.current_holder_id = f.id
      WHERE c.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async create(input: ChampionInput) {
    const sql = `
      INSERT INTO champions (
        title_name, champion_type, weight_class, organization, batch_id, event_name,
        current_holder_id, current_holder_name, nationality, status, defense_count,
        last_defense_date, next_defense_deadline, belt_image_url, trophy_image_url,
        certificate_url, notes, approval_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;
    const params = [
      input.titleName,
      input.championType,
      input.weightClass,
      input.organization || "KKF",
      input.batchId || null,
      input.eventName || null,
      input.currentHolderId || null,
      input.currentHolderName || null,
      input.nationality || null,
      input.status || "Vacant",
      input.defenseCount || 0,
      input.lastDefenseDate || null,
      input.nextDefenseDeadline || null,
      input.beltImageUrl || null,
      input.trophyImageUrl || null,
      input.certificateUrl || null,
      input.notes || null,
      input.approvalStatus || "approved"
    ];
    const result = await query(sql, params);
    return this.getById(result.rows[0].id);
  }

  static async update(id: string, input: Partial<ChampionInput>) {
    const keys = Object.keys(input);
    if (keys.length === 0) return this.getById(id);

    const setClauses: string[] = [];
    const params: any[] = [id];

    keys.forEach((key, index) => {
      const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      params.push((input as any)[key]);
      setClauses.push(`${dbKey} = $${index + 2}`);
    });

    const sql = `
      UPDATE champions 
      SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    await query(sql, params);
    return this.getById(id);
  }

  static async delete(id: string) {
    const result = await query("DELETE FROM champions WHERE id = $1 RETURNING *", [id]);
    return result.rows[0] || null;
  }
}
