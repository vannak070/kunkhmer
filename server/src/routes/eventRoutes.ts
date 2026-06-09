import { Router } from "express";
import { EventController } from "../controllers/eventController";
import { authenticateJWT, requireRole } from "../middlewares/validation";

const router = Router();

router.get("/", EventController.getAll);
router.get("/:id", EventController.getById);

router.post("/", authenticateJWT, requireRole(["Super Admin", "KKF Officer", "Organizer"]), EventController.create);
router.put("/:id", authenticateJWT, requireRole(["Super Admin", "KKF Officer", "Organizer"]), EventController.update);
router.delete("/:id", authenticateJWT, requireRole(["Super Admin"]), EventController.delete);

export default router;
