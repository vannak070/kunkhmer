import { Request, Response, NextFunction } from "express";
import { EventService } from "../services/eventService";

export class EventController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await EventService.getAll();
      return res.status(200).json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const event = await EventService.getById(id);
      if (!event) {
        return res.status(404).json({ success: false, error: "Event not found" });
      }
      return res.status(200).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Force organizerId to the current user
      if (req.user) {
        req.body.organizerId = req.user.id;
      }
      const newEvent = await EventService.create(req.body);
      return res.status(201).json({ success: true, data: newEvent });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedEvent = await EventService.update(id, req.body);
      if (!updatedEvent) {
        return res.status(404).json({ success: false, error: "Event not found" });
      }
      return res.status(200).json({ success: true, data: updatedEvent });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedEvent = await EventService.delete(id);
      if (!deletedEvent) {
        return res.status(404).json({ success: false, error: "Event not found" });
      }
      return res.status(200).json({ success: true, message: "Event deleted successfully", data: deletedEvent });
    } catch (error) {
      next(error);
    }
  }
}
