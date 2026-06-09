"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matchController_1 = require("../controllers/matchController");
const validation_1 = require("../middlewares/validation");
const router = (0, express_1.Router)();
// SubEvents (Batches)
router.get("/batches", matchController_1.MatchController.getAllSubEvents);
router.get("/batches/:id", matchController_1.MatchController.getSubEventById);
router.post("/batches", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin", "KKF Officer", "Organizer"]), matchController_1.MatchController.createSubEvent);
router.put("/batches/:id", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin", "KKF Officer", "Organizer"]), matchController_1.MatchController.updateSubEvent);
router.delete("/batches/:id", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin"]), matchController_1.MatchController.deleteSubEvent);
// Matches
router.get("/", matchController_1.MatchController.getMatches);
router.get("/:id", matchController_1.MatchController.getMatchById);
router.post("/", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin", "KKF Officer", "Organizer"]), matchController_1.MatchController.createMatch);
router.put("/:id", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin", "KKF Officer", "Organizer", "Club/Gym"]), matchController_1.MatchController.updateMatch);
router.delete("/:id", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin"]), matchController_1.MatchController.deleteMatch);
// Bout Results
router.post("/:id/result", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin", "KKF Officer"]), matchController_1.MatchController.setMatchResult);
exports.default = router;
