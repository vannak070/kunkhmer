import { query } from "../config/db";

export interface SponsorInput {
  name: string;
  logoUrl?: string;
  industry?: string;
  tier?: string;
  active?: boolean;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
}

export interface BroadcastStationInput {
  name: string;
  streamUrl?: string;
  type?: string;
  reach?: string;
  active?: boolean;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  logoUrl?: string;
}

export class SettingService {
  // --- SPONSORS ---
  static async getAllSponsors() {
    const result = await query("SELECT * FROM sponsors ORDER BY created_at DESC");
    return result.rows;
  }

  static async createSponsor(input: SponsorInput) {
    const result = await query(
      `INSERT INTO sponsors (
        name, logo_url, industry, tier, active, contact_person, contact_email, contact_phone, website_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        input.name,
        input.logoUrl || null,
        input.industry || null,
        input.tier || 'Gold',
        input.active !== false,
        input.contactPerson || null,
        input.contactEmail || null,
        input.contactPhone || null,
        input.websiteUrl || null
      ]
    );
    return result.rows[0];
  }

  static async updateSponsor(id: string, input: Partial<SponsorInput>) {
    const keys = Object.keys(input);
    if (keys.length === 0) {
      const res = await query("SELECT * FROM sponsors WHERE id = $1", [id]);
      return res.rows[0];
    }
    const setClauses: string[] = [];
    const params: any[] = [id];
    keys.forEach((key, index) => {
      const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      params.push((input as any)[key]);
      setClauses.push(`${dbKey} = $${index + 2}`);
    });
    const result = await query(
      `UPDATE sponsors SET ${setClauses.join(", ")} WHERE id = $1 RETURNING *`,
      params
    );
    return result.rows[0];
  }

  static async deleteSponsor(id: string) {
    const result = await query("DELETE FROM sponsors WHERE id = $1 RETURNING *", [id]);
    return result.rows[0] || null;
  }

  // --- BROADCAST STATIONS ---
  static async getAllBroadcastStations() {
    const result = await query("SELECT * FROM broadcast_stations ORDER BY created_at DESC");
    return result.rows;
  }

  static async createBroadcastStation(input: BroadcastStationInput) {
    const result = await query(
      `INSERT INTO broadcast_stations (
        name, stream_url, type, reach, active, contact_person, contact_email, contact_phone, website_url, logo_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        input.name,
        input.streamUrl || null,
        input.type || 'Cable TV',
        input.reach || 'National',
        input.active !== false,
        input.contactPerson || null,
        input.contactEmail || null,
        input.contactPhone || null,
        input.websiteUrl || null,
        input.logoUrl || null
      ]
    );
    return result.rows[0];
  }

  static async updateBroadcastStation(id: string, input: Partial<BroadcastStationInput>) {
    const keys = Object.keys(input);
    if (keys.length === 0) {
      const res = await query("SELECT * FROM broadcast_stations WHERE id = $1", [id]);
      return res.rows[0];
    }
    const setClauses: string[] = [];
    const params: any[] = [id];
    keys.forEach((key, index) => {
      const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      params.push((input as any)[key]);
      setClauses.push(`${dbKey} = $${index + 2}`);
    });
    const result = await query(
      `UPDATE broadcast_stations SET ${setClauses.join(", ")} WHERE id = $1 RETURNING *`,
      params
    );
    return result.rows[0];
  }

  static async deleteBroadcastStation(id: string) {
    const result = await query("DELETE FROM broadcast_stations WHERE id = $1 RETURNING *", [id]);
    return result.rows[0] || null;
  }
}
