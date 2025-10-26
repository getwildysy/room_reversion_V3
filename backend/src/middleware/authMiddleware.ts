// backend/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";

// 這是一個假的管理者驗證
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // 檢查請求的 header 中是否有 'x-admin' 且值為 'true'
  if (req.header("x-admin") === "true") {
    next(); // 是管理者，放行
  } else {
    // 不是管理者，回傳 403 (Forbidden)
    res.status(403).json({ message: "Forbidden: Admin access required." });
  }
};
