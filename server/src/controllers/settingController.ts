import { Request, Response, NextFunction } from "express";
import { SettingService } from "../services/settingService";

export class SettingController {
  // --- SPONSORS ---
  static async getAllSponsors(req: Request, res: Response, next: NextFunction) {
    try {
      const sponsors = await SettingService.getAllSponsors();
      return res.status(200).json({ success: true, data: sponsors });
    } catch (error) {
      next(error);
    }
  }

  static async createSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const newSponsor = await SettingService.createSponsor(req.body);
      return res.status(201).json({ success: true, data: newSponsor });
    } catch (error) {
      next(error);
    }
  }

  static async updateSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await SettingService.updateSponsor(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: "Sponsor not found" });
      }
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await SettingService.deleteSponsor(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Sponsor not found" });
      }
      return res.status(200).json({ success: true, message: "Sponsor deleted successfully", data: deleted });
    } catch (error) {
      next(error);
    }
  }

  // --- BROADCAST STATIONS ---
  static async getAllBroadcastStations(req: Request, res: Response, next: NextFunction) {
    try {
      const stations = await SettingService.getAllBroadcastStations();
      return res.status(200).json({ success: true, data: stations });
    } catch (error) {
      next(error);
    }
  }

  static async createBroadcastStation(req: Request, res: Response, next: NextFunction) {
    try {
      const newStation = await SettingService.createBroadcastStation(req.body);
      return res.status(201).json({ success: true, data: newStation });
    } catch (error) {
      next(error);
    }
  }

  static async updateBroadcastStation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await SettingService.updateBroadcastStation(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: "Broadcast station not found" });
      }
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBroadcastStation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await SettingService.deleteBroadcastStation(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Broadcast station not found" });
      }
      return res.status(200).json({ success: true, message: "Broadcast station deleted successfully", data: deleted });
    } catch (error) {
      next(error);
    }
  }
}
