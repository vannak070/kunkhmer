import { Router } from "express";
import { ChampionController } from "../controllers/championController";
import { authenticateJWT, requireRole } from "../middlewares/validation";

const router = Router();

router.get("/", ChampionController.getAll);
router.get("/:id", ChampionController.getById);

router.post("/", authenticateJWT, requireRole(["Super Admin", "KKF Officer"]), ChampionController.create);
router.put("/:id", authenticateJWT, requireRole(["Super Admin", "KKF Officer"]), ChampionController.update);
router.delete("/:id", authenticateJWT, requireRole(["Super Admin"]), ChampionController.delete);

export default router;
