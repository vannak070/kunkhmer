"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const db_1 = require("../config/db");
class EventService {
    static async getAll() {
        const result = await (0, db_1.query)(`
      SELECT e.*, u.full_name as organizer_name, 
             b.name as broadcast_station_name, b.logo_url as broadcast_station_logo_url,
             sp.name as main_sponsor_name, sp.logo_url as main_sponsor_logo_url
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN broadcast_stations b ON e.broadcast_station_id = b.id
      LEFT JOIN sponsors sp ON e.main_sponsor_id = sp.id
      ORDER BY e.date DESC, e.created_at DESC
    `);
        // For each event, get its sponsor ids
        const events = result.rows;
        for (let e of events) {
            const spResult = await (0, db_1.query)("SELECT sponsor_id FROM event_sponsors WHERE event_id = $1", [e.id]);
            e.sponsorIds = spResult.rows.map(row => row.sponsor_id);
        }
        return events;
    }
    static async getById(id) {
        const result = await (0, db_1.query)(`
      SELECT e.*, u.full_name as organizer_name, 
             b.name as broadcast_station_name, b.logo_url as broadcast_station_logo_url,
             sp.name as main_sponsor_name, sp.logo_url as main_sponsor_logo_url
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN broadcast_stations b ON e.broadcast_station_id = b.id
      LEFT JOIN sponsors sp ON e.main_sponsor_id = sp.id
      WHERE e.id = $1
    `, [id]);
        const event = result.rows[0];
        if (event) {
            const spResult = await (0, db_1.query)("SELECT sponsor_id FROM event_sponsors WHERE event_id = $1", [event.id]);
            event.sponsorIds = spResult.rows.map(row => row.sponsor_id);
        }
        return event || null;
    }
    static async create(input) {
        const sql = `
      INSERT INTO events (name, date, end_date, location, status, organizer_id, broadcast_station_id, description, image, main_sponsor_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
        const params = [
            input.name,
            input.date,
            input.endDate || null,
            input.location,
            input.status || "Draft",
            input.organizerId,
            input.broadcastStationId || null,
            input.description || null,
            input.image || null,
            input.mainSponsorId || null
        ];
        const result = await (0, db_1.query)(sql, params);
        const event = result.rows[0];
        // Seed sponsors junction
        if (input.sponsorIds && input.sponsorIds.length > 0) {
            for (const sponsorId of input.sponsorIds) {
                await (0, db_1.query)("INSERT INTO event_sponsors (event_id, sponsor_id) VALUES ($1, $2)", [event.id, sponsorId]);
            }
        }
        return this.getById(event.id);
    }
    static async update(id, input) {
        const keys = Object.keys(input).filter(k => k !== "sponsorIds");
        const setClauses = [];
        const params = [id];
        keys.forEach((key, index) => {
            const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            params.push(input[key]);
            setClauses.push(`${dbKey} = $${index + 2}`);
        });
        if (setClauses.length > 0) {
            const sql = `
        UPDATE events 
        SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
            await (0, db_1.query)(sql, params);
        }
        // Update sponsors list if provided
        if (input.sponsorIds) {
            await (0, db_1.query)("DELETE FROM event_sponsors WHERE event_id = $1", [id]);
            for (const sponsorId of input.sponsorIds) {
                await (0, db_1.query)("INSERT INTO event_sponsors (event_id, sponsor_id) VALUES ($1, $2)", [id, sponsorId]);
            }
        }
        return this.getById(id);
    }
    static async delete(id) {
        const result = await (0, db_1.query)("DELETE FROM events WHERE id = $1 RETURNING *", [id]);
        return result.rows[0] || null;
    }
}
exports.EventService = EventService;
