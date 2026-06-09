"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChampionController = void 0;
const championService_1 = require("../services/championService");
class ChampionController {
    static async getAll(req, res, next) {
        try {
            const champions = await championService_1.ChampionService.getAll();
            return res.status(200).json({ success: true, data: champions });
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const champion = await championService_1.ChampionService.getById(id);
            if (!champion) {
                return res.status(404).json({ success: false, error: "Champion not found" });
            }
            return res.status(200).json({ success: true, data: champion });
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const newChampion = await championService_1.ChampionService.create(req.body);
            return res.status(201).json({ success: true, data: newChampion });
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const updatedChampion = await championService_1.ChampionService.update(id, req.body);
            if (!updatedChampion) {
                return res.status(404).json({ success: false, error: "Champion not found" });
            }
            return res.status(200).json({ success: true, data: updatedChampion });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deletedChampion = await championService_1.ChampionService.delete(id);
            if (!deletedChampion) {
                return res.status(404).json({ success: false, error: "Champion not found" });
            }
            return res.status(200).json({ success: true, message: "Champion deleted successfully", data: deletedChampion });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ChampionController = ChampionController;
