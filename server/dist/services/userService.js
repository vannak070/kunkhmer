"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const db_1 = require("../config/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserService {
    static async login(username, password_hash) {
        const result = await (0, db_1.query)("SELECT * FROM users WHERE username = $1 AND password_hash = $2 AND status = 'Active'", [username, password_hash]);
        const user = result.rows[0];
        if (!user)
            return null;
        // Update last login
        await (0, db_1.query)("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);
        // Generate JWT
        const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret_key_here";
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            role: user.role,
            clubId: user.club_id
        }, jwtSecret, { expiresIn: "24h" });
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                email: user.email,
                role: user.role,
                clubId: user.club_id,
                status: user.status,
                lastLogin: user.last_login
            }
        };
    }
    static async getAll() {
        const result = await (0, db_1.query)("SELECT * FROM users ORDER BY created_at DESC");
        return result.rows;
    }
    static async getById(id) {
        const result = await (0, db_1.query)("SELECT * FROM users WHERE id = $1", [id]);
        return result.rows[0] || null;
    }
    static async create(input) {
        const sql = `
      INSERT INTO users (username, full_name, email, password_hash, role, club_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const params = [
            input.username,
            input.fullName,
            input.email,
            input.password || "password123", // default password
            input.role,
            input.clubId || null,
            input.status || "Active"
        ];
        const result = await (0, db_1.query)(sql, params);
        return result.rows[0];
    }
    static async update(id, input) {
        const keys = Object.keys(input).filter(k => k !== "password");
        const setClauses = [];
        const params = [id];
        keys.forEach((key, index) => {
            const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            params.push(input[key]);
            setClauses.push(`${dbKey} = $${index + 2}`);
        });
        if (input.password) {
            params.push(input.password);
            setClauses.push(`password_hash = $${params.length}`);
        }
        if (setClauses.length === 0)
            return this.getById(id);
        const sql = `
      UPDATE users 
      SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
        const result = await (0, db_1.query)(sql, params);
        return result.rows[0] || null;
    }
    static async delete(id) {
        const result = await (0, db_1.query)("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
        return result.rows[0] || null;
    }
}
exports.UserService = UserService;
