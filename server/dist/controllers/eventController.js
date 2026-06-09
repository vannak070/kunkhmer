"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const eventService_1 = require("../services/eventService");
class EventController {
    static async getAll(req, res, next) {
        try {
            const events = await eventService_1.EventService.getAll();
            return res.status(200).json({ success: true, data: events });
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const event = await eventService_1.EventService.getById(id);
            if (!event) {
                return res.status(404).json({ success: false, error: "Event not found" });
            }
            return res.status(200).json({ success: true, data: event });
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            // Force organizerId to the current user
            if (req.user) {
                req.body.organizerId = req.user.id;
            }
            const newEvent = await eventService_1.EventService.create(req.body);
            return res.status(201).json({ success: true, data: newEvent });
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const updatedEvent = await eventService_1.EventService.update(id, req.body);
            if (!updatedEvent) {
                return res.status(404).json({ success: false, error: "Event not found" });
            }
            return res.status(200).json({ success: true, data: updatedEvent });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deletedEvent = await eventService_1.EventService.delete(id);
            if (!deletedEvent) {
                return res.status(404).json({ success: false, error: "Event not found" });
            }
            return res.status(200).json({ success: true, message: "Event deleted successfully", data: deletedEvent });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EventController = EventController;
