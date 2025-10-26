// backend/src/routes/classroomRoutes.ts

import { Router } from "express";
import * as classroomController from "../controllers/classroomController";
// ↓↓↓ 必須匯入 "兩者" ↓↓↓
import { authenticateToken, isAdmin } from "../middleware/authMiddleware";

const router = Router();

// GET /api/classrooms (Read) - 這個仍然開放給所有人
router.get("/", classroomController.getAllClassrooms);

// --- 受保護的路由 ---
// 任何人要 C/U/D 教室，
// 必須 1. 先通過 Token 驗證 (authenticateToken)
// 必須 2. 再通過管理者驗證 (isAdmin)

// POST /api/classrooms (Create) - 僅限管理者
// ↓↓↓ 這一行是修正的關鍵 ↓↓↓
router.post(
  "/",
  authenticateToken,
  isAdmin,
  classroomController.createClassroom,
);

// PUT /api/classrooms/:id (Update) - 僅限管理者
router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  classroomController.updateClassroom,
);

// DELETE /api/classrooms/:id (Delete) - 僅限管理者
router.delete(
  "/:id",
  authenticateToken,
  isAdmin,
  classroomController.deleteClassroom,
);

export default router;
