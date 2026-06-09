"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingService = void 0;
const db_1 = require("../config/db");
class SettingService {
    // --- SPONSORS ---
    static async getAllSponsors() {
        const result = await (0, db_1.query)("SELECT * FROM sponsors ORDER BY created_at DESC");
        return result.rows;
    }
    static async createSponsor(input) {
        const result = await (0, db_1.query)(`INSERT INTO sponsors (
        name, logo_url, industry, tier, active, contact_person, contact_email, contact_phone, website_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [
            input.name,
            input.logoUrl || null,
            input.industry || null,
            input.tier || 'Gold',
            input.active !== false,
            input.contactPerson || null,
            input.contactEmail || null,
            input.contactPhone || null,
            input.websiteUrl || null
        ]);
        return result.rows[0];
    }
    static async updateSponsor(id, input) {
        const keys = Object.keys(input);
        if (keys.length === 0) {
            const res = await (0, db_1.query)("SELECT * FROM sponsors WHERE id = $1", [id]);
            return res.rows[0];
        }
        const setClauses = [];
        const params = [id];
        keys.forEach((key, index) => {
            const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            params.push(input[key]);
            setClauses.push(`${dbKey} = $${index + 2}`);
        });
        const result = await (0, db_1.query)(`UPDATE sponsors SET ${setClauses.join(", ")} WHERE id = $1 RETURNING *`, params);
        return result.rows[0];
    }
    static async deleteSponsor(id) {
        const result = await (0, db_1.query)("DELETE FROM sponsors WHERE id = $1 RETURNING *", [id]);
        return result.rows[0] || null;
    }
    // --- BROADCAST STATIONS ---
    static async getAllBroadcastStations() {
        const result = await (0, db_1.query)("SELECT * FROM broadcast_stations ORDER BY created_at DESC");
        return result.rows;
    }
    static async createBroadcastStation(input) {
        const result = await (0, db_1.query)(`INSERT INTO broadcast_stations (
        name, stream_url, type, reach, active, contact_person, contact_email, contact_phone, website_url, logo_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`, [
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
        ]);
        return result.rows[0];
    }
    static async updateBroadcastStation(id, input) {
        const keys = Object.keys(input);
        if (keys.length === 0) {
            const res = await (0, db_1.query)("SELECT * FROM broadcast_stations WHERE id = $1", [id]);
            return res.rows[0];
        }
        const setClauses = [];
        const params = [id];
        keys.forEach((key, index) => {
            const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            params.push(input[key]);
            setClauses.push(`${dbKey} = $${index + 2}`);
        });
        const result = await (0, db_1.query)(`UPDATE broadcast_stations SET ${setClauses.join(", ")} WHERE id = $1 RETURNING *`, params);
        return result.rows[0];
    }
    static async deleteBroadcastStation(id) {
        const result = await (0, db_1.query)("DELETE FROM broadcast_stations WHERE id = $1 RETURNING *", [id]);
        return result.rows[0] || null;
    }
}
exports.SettingService = SettingService;
