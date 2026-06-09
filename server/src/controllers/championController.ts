import { Request, Response, NextFunction } from "express";
import { ChampionService } from "../services/championService";

export class ChampionController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const champions = await ChampionService.getAll();
      return res.status(200).json({ success: true, data: champions });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const champion = await ChampionService.getById(id);
      if (!champion) {
        return res.status(404).json({ success: false, error: "Champion not found" });
      }
      return res.status(200).json({ success: true, data: champion });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const newChampion = await ChampionService.create(req.body);
      return res.status(201).json({ success: true, data: newChampion });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedChampion = await ChampionService.update(id, req.body);
      if (!updatedChampion) {
        return res.status(404).json({ success: false, error: "Champion not found" });
      }
      return res.status(200).json({ success: true, data: updatedChampion });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedChampion = await ChampionService.delete(id);
      if (!deletedChampion) {
        return res.status(404).json({ success: false, error: "Champion not found" });
      }
      return res.status(200).json({ success: true, message: "Champion deleted successfully", data: deletedChampion });
    } catch (error) {
      next(error);
    }
  }
}
