import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import jwt from "jsonwebtoken";

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: "Super Admin" | "KKF Officer" | "Organizer" | "Club/Gym" | "Viewer/Fan";
        clubId?: string | null;
      };
    }
  }
}

// 1. Zod Request Body Validation Middleware
export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors
      });
    }
  };
};

// 2. JWT Authentication Middleware
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized access: Missing token" });
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret_key_here";

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: "Forbidden access: Invalid or expired token" });
  }
};

// 3. Role-Based Access Control Middleware
export const requireRole = (roles: Array<"Super Admin" | "KKF Officer" | "Organizer" | "Club/Gym" | "Viewer/Fan">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized access" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};

// 4. Global Error Handler Middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
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
