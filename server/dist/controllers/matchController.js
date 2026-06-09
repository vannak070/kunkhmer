"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchController = void 0;
const matchService_1 = require("../services/matchService");
class MatchController {
    // --- SUB EVENTS / BATCHES ---
    static async getAllSubEvents(req, res, next) {
        try {
            const subEvents = await matchService_1.MatchService.getAllSubEvents();
            return res.status(200).json({ success: true, data: subEvents });
        }
        catch (error) {
            next(error);
        }
    }
    static async getSubEventById(req, res, next) {
        try {
            const { id } = req.params;
            const subEvent = await matchService_1.MatchService.getSubEventById(id);
            if (!subEvent) {
                return res.status(404).json({ success: false, error: "Sub-event (batch) not found" });
            }
            return res.status(200).json({ success: true, data: subEvent });
        }
        catch (error) {
            next(error);
        }
    }
    static async createSubEvent(req, res, next) {
        try {
            const userId = req.user?.id || "";
            const newSubEvent = await matchService_1.MatchService.createSubEvent(req.body, userId);
            return res.status(201).json({ success: true, data: newSubEvent });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateSubEvent(req, res, next) {
        try {
            const { id } = req.params;
            const updatedSubEvent = await matchService_1.MatchService.updateSubEvent(id, req.body);
            if (!updatedSubEvent) {
                return res.status(404).json({ success: false, error: "Sub-event (batch) not found" });
            }
            return res.status(200).json({ success: true, data: updatedSubEvent });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteSubEvent(req, res, next) {
        try {
            const { id } = req.params;
            const deletedSubEvent = await matchService_1.MatchService.deleteSubEvent(id);
            if (!deletedSubEvent) {
                return res.status(404).json({ success: false, error: "Sub-event (batch) not found" });
            }
            return res.status(200).json({ success: true, message: "Sub-event deleted successfully", data: deletedSubEvent });
        }
        catch (error) {
            next(error);
        }
    }
    // --- MATCHES ---
    static async getMatches(req, res, next) {
        try {
            const { subEventId } = req.query;
            const matches = await matchService_1.MatchService.getMatches(subEventId);
            return res.status(200).json({ success: true, data: matches });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMatchById(req, res, next) {
        try {
            const { id } = req.params;
            const match = await matchService_1.MatchService.getMatchById(id);
            if (!match) {
                return res.status(404).json({ success: false, error: "Match not found" });
            }
            return res.status(200).json({ success: true, data: match });
        }
        catch (error) {
            next(error);
        }
    }
    static async createMatch(req, res, next) {
        try {
            const newMatch = await matchService_1.MatchService.createMatch(req.body);
            return res.status(201).json({ success: true, data: newMatch });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMatch(req, res, next) {
        try {
            const { id } = req.params;
            const updatedMatch = await matchService_1.MatchService.updateMatch(id, req.body);
            if (!updatedMatch) {
                return res.status(404).json({ success: false, error: "Match not found" });
            }
            return res.status(200).json({ success: true, data: updatedMatch });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteMatch(req, res, next) {
        try {
            const { id } = req.params;
            const deletedMatch = await matchService_1.MatchService.deleteMatch(id);
            if (!deletedMatch) {
                return res.status(404).json({ success: false, error: "Match not found" });
            }
            return res.status(200).json({ success: true, message: "Match deleted successfully", data: deletedMatch });
        }
        catch (error) {
            next(error);
        }
    }
    static async setMatchResult(req, res, next) {
        try {
            const { id } = req.params;
            const matchWithResult = await matchService_1.MatchService.setMatchResult(id, req.body);
            return res.status(200).json({ success: true, data: matchWithResult });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MatchController = MatchController;
