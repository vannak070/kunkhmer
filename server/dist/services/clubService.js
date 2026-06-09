"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubService = void 0;
const db_1 = require("../config/db");
class ClubService {
    static async getAll() {
        // Return newest clubs first as requested by the user
        const result = await (0, db_1.query)("SELECT * FROM clubs ORDER BY created_at DESC");
        return result.rows;
    }
    static async getById(id) {
        const result = await (0, db_1.query)("SELECT * FROM clubs WHERE id = $1", [id]);
        return result.rows[0] || null;
    }
    static async create(input) {
        const sql = `
      INSERT INTO clubs (name, name_khmer, location, head_coach, status, rating, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const params = [
            input.name,
            input.nameKhmer || null,
            input.location || null,
            input.headCoach || null,
            input.status || "active",
            input.rating || 4.0,
            input.image || null
        ];
        const result = await (0, db_1.query)(sql, params);
        return result.rows[0];
    }
    static async update(id, input) {
        const keys = Object.keys(input);
        if (keys.length === 0)
            return this.getById(id);
        const setClauses = [];
        const params = [id];
        keys.forEach((key, index) => {
            const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            params.push(input[key]);
            setClauses.push(`${dbKey} = $${index + 2}`);
        });
        const sql = `
      UPDATE clubs 
      SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
        const result = await (0, db_1.query)(sql, params);
        return result.rows[0] || null;
    }
    static async delete(id) {
        const result = await (0, db_1.query)("DELETE FROM clubs WHERE id = $1 RETURNING *", [id]);
        return result.rows[0] || null;
    }
}
exports.ClubService = ClubService;
