import { Request, Response, NextFunction } from "express";
import { MatchService } from "../services/matchService";

export class MatchController {
  // --- SUB EVENTS / BATCHES ---
  static async getAllSubEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const subEvents = await MatchService.getAllSubEvents();
      return res.status(200).json({ success: true, data: subEvents });
    } catch (error) {
      next(error);
    }
  }

  static async getSubEventById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const subEvent = await MatchService.getSubEventById(id);
      if (!subEvent) {
        return res.status(404).json({ success: false, error: "Sub-event (batch) not found" });
      }
      return res.status(200).json({ success: true, data: subEvent });
    } catch (error) {
      next(error);
    }
  }

  static async createSubEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || "";
      const newSubEvent = await MatchService.createSubEvent(req.body, userId);
      return res.status(201).json({ success: true, data: newSubEvent });
    } catch (error) {
      next(error);
    }
  }

  static async updateSubEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedSubEvent = await MatchService.updateSubEvent(id, req.body);
      if (!updatedSubEvent) {
        return res.status(404).json({ success: false, error: "Sub-event (batch) not found" });
      }
      return res.status(200).json({ success: true, data: updatedSubEvent });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedSubEvent = await MatchService.deleteSubEvent(id);
      if (!deletedSubEvent) {
        return res.status(404).json({ success: false, error: "Sub-event (batch) not found" });
      }
      return res.status(200).json({ success: true, message: "Sub-event deleted successfully", data: deletedSubEvent });
    } catch (error) {
      next(error);
    }
  }

  // --- MATCHES ---
  static async getMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const { subEventId } = req.query;
      const matches = await MatchService.getMatches(subEventId as string);
      return res.status(200).json({ success: true, data: matches });
    } catch (error) {
      next(error);
    }
  }

  static async getMatchById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const match = await MatchService.getMatchById(id);
      if (!match) {
        return res.status(404).json({ success: false, error: "Match not found" });
      }
      return res.status(200).json({ success: true, data: match });
    } catch (error) {
      next(error);
    }
  }

  static async createMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const newMatch = await MatchService.createMatch(req.body);
      return res.status(201).json({ success: true, data: newMatch });
    } catch (error) {
      next(error);
    }
  }

  static async updateMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedMatch = await MatchService.updateMatch(id, req.body);
      if (!updatedMatch) {
        return res.status(404).json({ success: false, error: "Match not found" });
      }
      return res.status(200).json({ success: true, data: updatedMatch });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedMatch = await MatchService.deleteMatch(id);
      if (!deletedMatch) {
        return res.status(404).json({ success: false, error: "Match not found" });
      }
      return res.status(200).json({ success: true, message: "Match deleted successfully", data: deletedMatch });
    } catch (error) {
      next(error);
    }
  }

  static async setMatchResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const matchWithResult = await MatchService.setMatchResult(id, req.body);
      return res.status(200).json({ success: true, data: matchWithResult });
    } catch (error) {
      next(error);
    }
  }
}
