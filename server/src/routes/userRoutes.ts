import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authenticateJWT, requireRole, validateBody } from "../middlewares/validation";
import { LoginSchema, RegisterSchema } from "../validators/schemas";

const router = Router();

router.post("/login", validateBody(LoginSchema), UserController.login);

// Protected user management routes
router.get("/", authenticateJWT, requireRole(["Super Admin"]), UserController.getAll);
router.get("/:id", authenticateJWT, UserController.getById);
router.post("/", authenticateJWT, requireRole(["Super Admin"]), validateBody(RegisterSchema), UserController.create);
router.put("/:id", authenticateJWT, UserController.update);
router.delete("/:id", authenticateJWT, requireRole(["Super Admin"]), UserController.delete);

export default router;
