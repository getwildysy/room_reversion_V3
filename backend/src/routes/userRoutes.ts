import { Router } from "express";
import * as userController from "../controllers/userController";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware";

const router = Router();

// ★★★ 所有使用者 API 都必須是管理者 ★★★
router.use(authenticateToken, isAdmin);

// GET /api/users
router.get("/", userController.getAllUsers);

// PUT /api/users/:id/role
router.put("/:id/role", userController.updateUserRole);

// DELETE /api/users/:id
router.delete("/:id", userController.deleteUser);

export default router;
