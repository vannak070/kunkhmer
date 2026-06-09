"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const validation_1 = require("../middlewares/validation");
const schemas_1 = require("../validators/schemas");
const router = (0, express_1.Router)();
router.post("/login", (0, validation_1.validateBody)(schemas_1.LoginSchema), userController_1.UserController.login);
// Protected user management routes
router.get("/", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin"]), userController_1.UserController.getAll);
router.get("/:id", validation_1.authenticateJWT, userController_1.UserController.getById);
router.post("/", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin"]), (0, validation_1.validateBody)(schemas_1.RegisterSchema), userController_1.UserController.create);
router.put("/:id", validation_1.authenticateJWT, userController_1.UserController.update);
router.delete("/:id", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin"]), userController_1.UserController.delete);
exports.default = router;
