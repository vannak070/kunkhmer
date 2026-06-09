"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwardCreateSchema = exports.BoutResultSchema = exports.ClubResponseSchema = exports.GloveAgreementSchema = exports.MatchCreateSchema = exports.SubEventSchema = exports.EventCreateSchema = exports.FighterUpdateSchema = exports.FighterCreateSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
// 1. Authentication Schemas
exports.RegisterSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    fullName: zod_1.z.string().min(3).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(["Super Admin", "KKF Officer", "Organizer", "Club/Gym", "Viewer/Fan"]).default("Viewer/Fan"),
    clubId: zod_1.z.string().uuid().optional().nullable()
});
exports.LoginSchema = zod_1.z.object({
    username: zod_1.z.string().min(3),
    password: zod_1.z.string()
});
// 2. Fighter Schemas
exports.FighterCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "English name is required"),
    nameKhmer: zod_1.z.string().min(1, "Khmer name is required"),
    alias: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format"
    }),
    nationality: zod_1.z.string().default("Cambodian"),
    province: zod_1.z.string().optional(),
    gender: zod_1.z.enum(["Male", "Female"]),
    currentWeight: zod_1.z.number().min(30).max(150),
    height: zod_1.z.number().positive(),
    clubId: zod_1.z.string().uuid().optional().nullable(),
    style: zod_1.z.string().optional(),
    grade: zod_1.z.enum(["A", "B", "C", "D"]).default("D")
});
exports.FighterUpdateSchema = exports.FighterCreateSchema.partial();
// 3. Event & Sub-Event Schemas
exports.EventCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Event name is required"),
    date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format"
    }),
    location: zod_1.z.string().min(1, "Location is required"),
    broadcastStationId: zod_1.z.string().uuid().optional().nullable(),
    sponsorIds: zod_1.z.array(zod_1.z.string().uuid()).optional()
});
exports.SubEventSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    weekNumber: zod_1.z.number().int().positive(),
    date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val))),
    location: zod_1.z.string().min(1),
    phase: zod_1.z.enum(["Qualifier", "Semi-Final", "Final"]).default("Qualifier")
});
// 4. Match & Glove Agreement Schemas
exports.MatchCreateSchema = zod_1.z.object({
    eventId: zod_1.z.string().uuid(),
    subEventId: zod_1.z.string().uuid(),
    fighterAId: zod_1.z.string().uuid(),
    fighterBId: zod_1.z.string().uuid(),
    rounds: zod_1.z.union([zod_1.z.literal(3), zod_1.z.literal(5)]),
    roundTime: zod_1.z.union([zod_1.z.literal(2), zod_1.z.literal(3), zod_1.z.literal(5)]),
    knockdownLimit: zod_1.z.number().int().positive(),
    agreedWeight: zod_1.z.number().positive(),
    gloveSize: zod_1.z.enum(["6oz", "8oz", "10oz"]),
    gloveBrand: zod_1.z.string().min(1)
});
exports.GloveAgreementSchema = zod_1.z.object({
    fighterAConfirmed: zod_1.z.boolean(),
    fighterBConfirmed: zod_1.z.boolean(),
    refereeConfirmed: zod_1.z.boolean().optional()
});
exports.ClubResponseSchema = zod_1.z.object({
    clubAResponse: zod_1.z.enum(["pending", "accepted", "rejected"]),
    clubBResponse: zod_1.z.enum(["pending", "accepted", "rejected"])
});
exports.BoutResultSchema = zod_1.z.object({
    winnerId: zod_1.z.string().uuid().optional().nullable(), // Null means Draw/No Contest
    method: zod_1.z.enum(["KO", "TKO", "Decision", "Submission", "Draw", "No Contest"]),
    round: zod_1.z.number().int().positive(),
    duration: zod_1.z.string().optional() // e.g. "1:45"
});
// 5. Championship Award Schema
exports.AwardCreateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    category: zod_1.z.enum(["Individual", "Team", "Special"]),
    eligibilityCriteria: zod_1.z.string().optional()
});
