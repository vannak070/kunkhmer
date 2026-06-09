"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.requireRole = exports.authenticateJWT = exports.validateBody = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// 1. Zod Request Body Validation Middleware
const validateBody = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            return next();
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: error.errors
            });
        }
    };
};
exports.validateBody = validateBody;
// 2. JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, error: "Unauthorized access: Missing token" });
    }
    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret_key_here";
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ success: false, error: "Forbidden access: Invalid or expired token" });
    }
};
exports.authenticateJWT = authenticateJWT;
// 3. Role-Based Access Control Middleware
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: "Unauthorized access" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: "Forbidden: Insufficient permissions" });
        }
        next();
    };
};
exports.requireRole = requireRole;
// 4. Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(status).json({
        success: false,
        error: {
            message,
            status,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined
        }
    });
};
exports.errorHandler = errorHandler;
