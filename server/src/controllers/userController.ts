import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";

export class UserController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const result = await UserService.login(username, password);
      if (!result) {
        return res.status(401).json({ success: false, error: "Invalid username or password" });
      }
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAll();
      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UserService.getById(id);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const newUser = await UserService.create(req.body);
      return res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedUser = await UserService.update(id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      return res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedUser = await UserService.delete(id);
      if (!deletedUser) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      return res.status(200).json({ success: true, message: "User deleted successfully", data: deletedUser });
    } catch (error) {
      next(error);
    }
  }
}
