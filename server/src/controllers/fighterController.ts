import { Request, Response, NextFunction } from "express";
import { FighterService } from "../services/fighterService";

export class FighterController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, clubId } = req.query;
      const fighters = await FighterService.getAll(status as string, clubId as string);
      return res.status(200).json({ success: true, data: fighters });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const fighter = await FighterService.getById(id);
      if (!fighter) {
        return res.status(404).json({ success: false, error: "Fighter not found" });
      }
      return res.status(200).json({ success: true, data: fighter });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // If user is a Club/Gym, force the registered clubId to prevent spoofing
      if (req.user?.role === "Club/Gym" && req.user.clubId) {
        req.body.clubId = req.user.clubId;
      }
      const newFighter = await FighterService.create(req.body);
      return res.status(201).json({ success: true, data: newFighter });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Authorization Check: Clubs can only edit their own fighters
      if (req.user?.role === "Club/Gym" && req.user.clubId) {
        const fighter = await FighterService.getById(id);
        if (fighter && fighter.club_id !== req.user.clubId) {
          return res.status(403).json({ success: false, error: "Forbidden: You do not own this fighter profile" });
        }
      }

      const updatedFighter = await FighterService.update(id, req.body);
      if (!updatedFighter) {
        return res.status(404).json({ success: false, error: "Fighter not found" });
      }
      return res.status(200).json({ success: true, data: updatedFighter });
    } catch (error) {
      next(error);
    }
  }

  static async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const officerId = req.user?.id || "";
      const verifiedFighter = await FighterService.verify(id, officerId);
      if (!verifiedFighter) {
        return res.status(404).json({ success: false, error: "Fighter not found" });
      }
      return res.status(200).json({ success: true, data: verifiedFighter });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedFighter = await FighterService.delete(id);
      if (!deletedFighter) {
        return res.status(404).json({ success: false, error: "Fighter not found" });
      }
      return res.status(200).json({ success: true, message: "Fighter successfully deleted", data: deletedFighter });
    } catch (error) {
      next(error);
    }
  }
}
