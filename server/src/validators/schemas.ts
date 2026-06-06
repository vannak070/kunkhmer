import { z } from "zod";

// 1. Authentication Schemas
export const RegisterSchema = z.object({
  username: z.string().min(3).max(50),
  fullName: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["Super Admin", "KKF Officer", "Organizer", "Club/Gym", "Viewer/Fan"]).default("Viewer/Fan"),
  clubId: z.string().uuid().optional().nullable()
});

export const LoginSchema = z.object({
  username: z.string().min(3),
  password: z.string()
});

// 2. Fighter Schemas
export const FighterCreateSchema = z.object({
  name: z.string().min(1, "English name is required"),
  nameKhmer: z.string().min(1, "Khmer name is required"),
  alias: z.string().optional(),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }),
  nationality: z.string().default("Cambodian"),
  province: z.string().optional(),
  gender: z.enum(["Male", "Female"]),
  currentWeight: z.number().min(30).max(150),
  height: z.number().positive(),
  clubId: z.string().uuid().optional().nullable(),
  style: z.string().optional(),
  grade: z.enum(["A", "B", "C", "D"]).default("D")
});

export const FighterUpdateSchema = FighterCreateSchema.partial();

// 3. Event & Sub-Event Schemas
export const EventCreateSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }),
  location: z.string().min(1, "Location is required"),
  broadcastStationId: z.string().uuid().optional().nullable(),
  sponsorIds: z.array(z.string().uuid()).optional()
});

export const SubEventSchema = z.object({
  name: z.string().min(1),
  weekNumber: z.number().int().positive(),
  date: z.string().refine((val) => !isNaN(Date.parse(val))),
  location: z.string().min(1),
  phase: z.enum(["Qualifier", "Semi-Final", "Final"]).default("Qualifier")
});

// 4. Match & Glove Agreement Schemas
export const MatchCreateSchema = z.object({
  eventId: z.string().uuid(),
  subEventId: z.string().uuid(),
  fighterAId: z.string().uuid(),
  fighterBId: z.string().uuid(),
  rounds: z.union([z.literal(3), z.literal(5)]),
  roundTime: z.union([z.literal(2), z.literal(3), z.literal(5)]),
  knockdownLimit: z.number().int().positive(),
  agreedWeight: z.number().positive(),
  gloveSize: z.enum(["6oz", "8oz", "10oz"]),
  gloveBrand: z.string().min(1)
});

export const GloveAgreementSchema = z.object({
  fighterAConfirmed: z.boolean(),
  fighterBConfirmed: z.boolean(),
  refereeConfirmed: z.boolean().optional()
});

export const ClubResponseSchema = z.object({
  clubAResponse: z.enum(["pending", "accepted", "rejected"]),
  clubBResponse: z.enum(["pending", "accepted", "rejected"])
});

export const BoutResultSchema = z.object({
  winnerId: z.string().uuid().optional().nullable(), // Null means Draw/No Contest
  method: z.enum(["KO", "TKO", "Decision", "Submission", "Draw", "No Contest"]),
  round: z.number().int().positive(),
  duration: z.string().optional() // e.g. "1:45"
});

// 5. Championship Award Schema
export const AwardCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(["Individual", "Team", "Special"]),
  eligibilityCriteria: z.string().optional()
});
