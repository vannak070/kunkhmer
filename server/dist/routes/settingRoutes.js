"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settingController_1 = require("../controllers/settingController");
const validation_1 = require("../middlewares/validation");
const router = (0, express_1.Router)();
// Sponsors
router.get("/sponsors", settingController_1.SettingController.getAllSponsors);
router.post("/sponsors", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin", "KKF Officer"]), settingController_1.SettingController.createSponsor);
router.put("/sponsors/:id", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin", "KKF Officer"]), settingController_1.SettingController.updateSponsor);
router.delete("/sponsors/:id", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin"]), settingController_1.SettingController.deleteSponsor);
// Broadcast Stations
router.get("/broadcast-stations", settingController_1.SettingController.getAllBroadcastStations);
router.post("/broadcast-stations", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin", "KKF Officer"]), settingController_1.SettingController.createBroadcastStation);
router.put("/broadcast-stations/:id", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin", "KKF Officer"]), settingController_1.SettingController.updateBroadcastStation);
router.delete("/broadcast-stations/:id", validation_1.authenticateJWT, (0, validation_1.requireRole)(["Super Admin"]), settingController_1.SettingController.deleteBroadcastStation);
exports.default = router;
