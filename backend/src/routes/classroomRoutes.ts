// backend/src/routes/classroomRoutes.ts

import { Router } from "express";
import * as classroomController from "../controllers/classroomController";
import { isAdmin } from "../middleware/authMiddleware"; // 匯入我們的管理者驗證

const router = Router();

// GET /api/classrooms (Read) - 開放給所有人
router.get("/", classroomController.getAllClassrooms);

// POST /api/classrooms (Create) - 僅限管理者
router.post("/", isAdmin, classroomController.createClassroom);

// PUT /api/classrooms/:id (Update) - 僅限管理者
router.put("/:id", isAdmin, classroomController.updateClassroom);

// DELETE /api/classrooms/:id (Delete) - 僅限管理者
router.delete("/:id", isAdmin, classroomController.deleteClassroom);

export default router;
