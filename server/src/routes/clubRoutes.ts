import { Router } from "express";
import { ClubController } from "../controllers/clubController";
import { authenticateJWT, requireRole } from "../middlewares/validation";

const router = Router();

router.get("/", ClubController.getAll);
router.get("/:id", ClubController.getById);

router.post("/", authenticateJWT, requireRole(["Super Admin", "KKF Officer"]), ClubController.create);
router.put("/:id", authenticateJWT, requireRole(["Super Admin", "KKF Officer"]), ClubController.update);
router.delete("/:id", authenticateJWT, requireRole(["Super Admin"]), ClubController.delete);

export default router;
