"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../services/userService");
class UserController {
    static async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const result = await userService_1.UserService.login(username, password);
            if (!result) {
                return res.status(401).json({ success: false, error: "Invalid username or password" });
            }
            return res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAll(req, res, next) {
        try {
            const users = await userService_1.UserService.getAll();
            return res.status(200).json({ success: true, data: users });
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await userService_1.UserService.getById(id);
            if (!user) {
                return res.status(404).json({ success: false, error: "User not found" });
            }
            return res.status(200).json({ success: true, data: user });
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const newUser = await userService_1.UserService.create(req.body);
            return res.status(201).json({ success: true, data: newUser });
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const updatedUser = await userService_1.UserService.update(id, req.body);
            if (!updatedUser) {
                return res.status(404).json({ success: false, error: "User not found" });
            }
            return res.status(200).json({ success: true, data: updatedUser });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deletedUser = await userService_1.UserService.delete(id);
            if (!deletedUser) {
                return res.status(404).json({ success: false, error: "User not found" });
            }
            return res.status(200).json({ success: true, message: "User deleted successfully", data: deletedUser });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
