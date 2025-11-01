import { Router } from "express";
import * as userController from "../controllers/userController";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware";

const router = Router();

// ★★★ 所有使用者 API 都必須是管理者 ★★★
router.use(authenticateToken, isAdmin);

// GET /api/users
router.get("/", userController.getAllUsers);

// GET /api/users/pending
router.get("/pending", userController.getPendingUsers);

// PUT /api/users/:id/approve
router.put("/:id/approve", userController.approveUser);

// POST /api/users (新增)
router.post("/", userController.createUser);

// PUT /api/users/:id/role
router.put("/:id", userController.updateUser);

// PUT /api/users/:id/password (新增)
router.put("/:id/password", userController.resetPassword);

// DELETE /api/users/:id
router.delete("/:id", userController.deleteUser);

export default router;
