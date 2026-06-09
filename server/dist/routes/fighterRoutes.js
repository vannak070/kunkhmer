"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fighterController_1 = require("../controllers/fighterController");
const validation_1 = require("../middlewares/validation");
const schemas_1 = require("../validators/schemas");
const router = (0, express_1.Router)();
// Public / general endpoints
router.get("/", fighterController_1.FighterController.getAll);
router.get("/:id", fighterController_1.FighterController.getById);
// Protected endpoints
router.post("/", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin", "Organizer", "Club/Gym"]), (0, validation_1.validateBody)(schemas_1.FighterCreateSchema), fighterController_1.FighterController.create);
router.put("/:id", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin", "Club/Gym"]), (0, validation_1.validateBody)(schemas_1.FighterUpdateSchema), fighterController_1.FighterController.update);
router.post("/:id/verify", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin", "KKF Officer"]), fighterController_1.FighterController.verify);
router.delete("/:id", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin"]), fighterController_1.FighterController.delete);
exports.default = router;
