import { Router } from "express";
import { FighterController } from "../controllers/fighterController";
import { validateBody, authenticateJWT, requireRole } from "../middlewares/validation";
import { FighterCreateSchema, FighterUpdateSchema } from "../validators/schemas";

const router = Router();

// Public / general endpoints
router.get("/", FighterController.getAll);
router.get("/:id", FighterController.getById);

// Protected endpoints
router.post(
  "/",
  authenticateJWT,
  requireRole(["Super Admin", "Organizer", "Club/Gym"]),
  validateBody(FighterCreateSchema),
  FighterController.create
);

router.put(
  "/:id",
  authenticateJWT,
  requireRole(["Super Admin", "Club/Gym"]),
  validateBody(FighterUpdateSchema),
  FighterController.update
);

router.post(
  "/:id/verify",
  authenticateJWT,
  requireRole(["Super Admin", "KKF Officer"]),
  FighterController.verify
);

router.delete(
  "/:id",
  authenticateJWT,
  requireRole(["Super Admin"]),
  FighterController.delete
);

export default router;
