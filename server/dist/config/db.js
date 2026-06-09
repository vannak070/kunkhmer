"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.dbPool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/kun_khmer_db";
exports.dbPool = new pg_1.Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
const query = async (text, params) => {
    const start = Date.now();
    const res = await exports.dbPool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development") {
        console.log("Executed query:", { text, duration, rowsCount: res.rowCount });
    }
    return res;
};
exports.query = query;
