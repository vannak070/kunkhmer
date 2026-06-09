"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FighterController = void 0;
const fighterService_1 = require("../services/fighterService");
class FighterController {
    static async getAll(req, res, next) {
        try {
            const { status, clubId } = req.query;
            const fighters = await fighterService_1.FighterService.getAll(status, clubId);
            return res.status(200).json({ success: true, data: fighters });
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const fighter = await fighterService_1.FighterService.getById(id);
            if (!fighter) {
                return res.status(404).json({ success: false, error: "Fighter not found" });
            }
            return res.status(200).json({ success: true, data: fighter });
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            // If user is a Club/Gym, force the registered clubId to prevent spoofing
            if (req.user?.role === "Club/Gym" && req.user.clubId) {
                req.body.clubId = req.user.clubId;
            }
            const newFighter = await fighterService_1.FighterService.create(req.body);
            return res.status(201).json({ success: true, data: newFighter });
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            // Authorization Check: Clubs can only edit their own fighters
            if (req.user?.role === "Club/Gym" && req.user.clubId) {
                const fighter = await fighterService_1.FighterService.getById(id);
                if (fighter && fighter.club_id !== req.user.clubId) {
                    return res.status(403).json({ success: false, error: "Forbidden: You do not own this fighter profile" });
                }
            }
            const updatedFighter = await fighterService_1.FighterService.update(id, req.body);
            if (!updatedFighter) {
                return res.status(404).json({ success: false, error: "Fighter not found" });
            }
            return res.status(200).json({ success: true, data: updatedFighter });
        }
        catch (error) {
            next(error);
        }
    }
    static async verify(req, res, next) {
        try {
            const { id } = req.params;
            const officerId = req.user?.id || "";
            const verifiedFighter = await fighterService_1.FighterService.verify(id, officerId);
            if (!verifiedFighter) {
                return res.status(404).json({ success: false, error: "Fighter not found" });
            }
            return res.status(200).json({ success: true, data: verifiedFighter });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deletedFighter = await fighterService_1.FighterService.delete(id);
            if (!deletedFighter) {
                return res.status(404).json({ success: false, error: "Fighter not found" });
            }
            return res.status(200).json({ success: true, message: "Fighter successfully deleted", data: deletedFighter });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FighterController = FighterController;
