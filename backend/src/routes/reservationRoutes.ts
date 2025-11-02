// backend/src/routes/reservationRoutes.ts

import { Router } from "express";
import * as reservationController from "../controllers/reservationController";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware";

const router = Router();

// GET /api/reservations - 取得所有預約 (開放)
router.get("/", reservationController.getReservations);

// --- ★ 新增：管理者批次預約路由 ★ ---
// POST /api/reservations/batch
router.post(
  "/batch",
  authenticateToken,
  isAdmin,
  reservationController.createBatchReservation,
);

// DELETE /api/reservations/batch/:batch_id
router.delete(
  "/batch/:batch_id",
  authenticateToken,
  isAdmin,
  reservationController.deleteBatchReservation,
);
// ------------------------------------

// --- 以下路由需要登入 ---

// GET /api/reservations/my - 取得 "我" 的預約
router.get("/my", authenticateToken, reservationController.getMyReservations);

// POST /api/reservations - 建立新預約
router.post("/", authenticateToken, reservationController.createReservation);

// DELETE /api/reservations/:id - 刪除預約 (管理者或本人)
router.delete(
  "/:id",
  authenticateToken,
  reservationController.deleteReservation,
);

export default router;
