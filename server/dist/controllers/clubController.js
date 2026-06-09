"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubController = void 0;
const clubService_1 = require("../services/clubService");
class ClubController {
    static async getAll(req, res, next) {
        try {
            const clubs = await clubService_1.ClubService.getAll();
            return res.status(200).json({ success: true, data: clubs });
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const club = await clubService_1.ClubService.getById(id);
            if (!club) {
                return res.status(404).json({ success: false, error: "Club not found" });
            }
            return res.status(200).json({ success: true, data: club });
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const newClub = await clubService_1.ClubService.create(req.body);
            return res.status(201).json({ success: true, data: newClub });
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const updatedClub = await clubService_1.ClubService.update(id, req.body);
            if (!updatedClub) {
                return res.status(404).json({ success: false, error: "Club not found" });
            }
            return res.status(200).json({ success: true, data: updatedClub });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deletedClub = await clubService_1.ClubService.delete(id);
            if (!deletedClub) {
                return res.status(404).json({ success: false, error: "Club not found" });
            }
            return res.status(200).json({ success: true, message: "Club deleted successfully", data: deletedClub });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ClubController = ClubController;
