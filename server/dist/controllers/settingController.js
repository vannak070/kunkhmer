"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingController = void 0;
const settingService_1 = require("../services/settingService");
class SettingController {
    // --- SPONSORS ---
    static async getAllSponsors(req, res, next) {
        try {
            const sponsors = await settingService_1.SettingService.getAllSponsors();
            return res.status(200).json({ success: true, data: sponsors });
        }
        catch (error) {
            next(error);
        }
    }
    static async createSponsor(req, res, next) {
        try {
            const newSponsor = await settingService_1.SettingService.createSponsor(req.body);
            return res.status(201).json({ success: true, data: newSponsor });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateSponsor(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await settingService_1.SettingService.updateSponsor(id, req.body);
            if (!updated) {
                return res.status(404).json({ success: false, error: "Sponsor not found" });
            }
            return res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteSponsor(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await settingService_1.SettingService.deleteSponsor(id);
            if (!deleted) {
                return res.status(404).json({ success: false, error: "Sponsor not found" });
            }
            return res.status(200).json({ success: true, message: "Sponsor deleted successfully", data: deleted });
        }
        catch (error) {
            next(error);
        }
    }
    // --- BROADCAST STATIONS ---
    static async getAllBroadcastStations(req, res, next) {
        try {
            const stations = await settingService_1.SettingService.getAllBroadcastStations();
            return res.status(200).json({ success: true, data: stations });
        }
        catch (error) {
            next(error);
        }
    }
    static async createBroadcastStation(req, res, next) {
        try {
            const newStation = await settingService_1.SettingService.createBroadcastStation(req.body);
            return res.status(201).json({ success: true, data: newStation });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateBroadcastStation(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await settingService_1.SettingService.updateBroadcastStation(id, req.body);
            if (!updated) {
                return res.status(404).json({ success: false, error: "Broadcast station not found" });
            }
            return res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteBroadcastStation(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await settingService_1.SettingService.deleteBroadcastStation(id);
            if (!deleted) {
                return res.status(404).json({ success: false, error: "Broadcast station not found" });
            }
            return res.status(200).json({ success: true, message: "Broadcast station deleted successfully", data: deleted });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SettingController = SettingController;
