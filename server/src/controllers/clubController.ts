import { Request, Response, NextFunction } from "express";
import { ClubService } from "../services/clubService";

export class ClubController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const clubs = await ClubService.getAll();
      return res.status(200).json({ success: true, data: clubs });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const club = await ClubService.getById(id);
      if (!club) {
        return res.status(404).json({ success: false, error: "Club not found" });
      }
      return res.status(200).json({ success: true, data: club });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const newClub = await ClubService.create(req.body);
      return res.status(201).json({ success: true, data: newClub });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedClub = await ClubService.update(id, req.body);
      if (!updatedClub) {
        return res.status(404).json({ success: false, error: "Club not found" });
      }
      return res.status(200).json({ success: true, data: updatedClub });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedClub = await ClubService.delete(id);
      if (!deletedClub) {
        return res.status(404).json({ success: false, error: "Club not found" });
      }
      return res.status(200).json({ success: true, message: "Club deleted successfully", data: deletedClub });
    } catch (error) {
      next(error);
    }
  }
}
