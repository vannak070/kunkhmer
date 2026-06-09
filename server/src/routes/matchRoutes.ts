import { Router } from "express";
import { MatchController } from "../controllers/matchController";
import { authenticateJWT, requireRole } from "../middlewares/validation";

const router = Router();

// SubEvents (Batches)
router.get("/batches", MatchController.getAllSubEvents);
router.get("/batches/:id", MatchController.getSubEventById);
router.post("/batches", authenticateJWT, requireRole(["Super Admin", "KKF Officer", "Organizer"]), MatchController.createSubEvent);
router.put("/batches/:id", authenticateJWT, requireRole(["Super Admin", "KKF Officer", "Organizer"]), MatchController.updateSubEvent);
router.delete("/batches/:id", authenticateJWT, requireRole(["Super Admin"]), MatchController.deleteSubEvent);

// Matches
router.get("/", MatchController.getMatches);
router.get("/:id", MatchController.getMatchById);
router.post("/", authenticateJWT, requireRole(["Super Admin", "KKF Officer", "Organizer"]), MatchController.createMatch);
router.put("/:id", authenticateJWT, requireRole(["Super Admin", "KKF Officer", "Organizer", "Club/Gym"]), MatchController.updateMatch);
router.delete("/:id", authenticateJWT, requireRole(["Super Admin"]), MatchController.deleteMatch);

// Bout Results
router.post("/:id/result", authenticateJWT, requireRole(["Super Admin", "KKF Officer"]), MatchController.setMatchResult);

export default router;
