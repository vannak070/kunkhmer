import { Router } from "express";
import { SettingController } from "../controllers/settingController";
import { authenticateJWT, requireRole } from "../middlewares/validation";

const router = Router();

// Sponsors
router.get("/sponsors", SettingController.getAllSponsors);
router.post("/sponsors", authenticateJWT, requireRole(["Super Admin", "KKF Officer"]), SettingController.createSponsor);
router.put("/sponsors/:id", authenticateJWT, requireRole(["Super Admin", "KKF Officer"]), SettingController.updateSponsor);
router.delete("/sponsors/:id", authenticateJWT, requireRole(["Super Admin"]), SettingController.deleteSponsor);

// Broadcast Stations
router.get("/broadcast-stations", SettingController.getAllBroadcastStations);
router.post("/broadcast-stations", authenticateJWT, requireRole(["Super Admin", "KKF Officer"]), SettingController.createBroadcastStation);
router.put("/broadcast-stations/:id", authenticateJWT, requireRole(["Super Admin", "KKF Officer"]), SettingController.updateBroadcastStation);
router.delete("/broadcast-stations/:id", authenticateJWT, requireRole(["Super Admin"]), SettingController.deleteBroadcastStation);

export default router;
