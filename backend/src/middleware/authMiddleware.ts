// backend/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// --- ★★★ 這是修正的地方 ★★★ ---
// 從 .env 讀取密鑰，確保與 authController.ts 一致
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "[Server] FATAL ERROR: JWT_SECRET is not defined in .env file (authMiddleware)",
  );
}
// ---------------------------------

// 這是我們從 JWT payload 解碼出來的使用者資訊
interface UserPayload {
  id: number;
  username: string;
  role: "user" | "admin";
  nickname: string; // 確保 nickname 也包含在內
}

// 替 Express 的 Request 介面 "擴充" 一個可選的 user 屬性
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// 1. 認證 Token 的中間件
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "Access token required." });
  }

  // ★ 這裡現在會使用 .env 中的密鑰來驗證
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      // 403 Forbidden (權杖無效或過期)
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // 將解碼後的使用者資訊 (payload) 存入 req.user
    req.user = user as UserPayload;

    next();
  });
};

// 2. 檢查是否為管理者的中間件 (不變)
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Admin access required." });
  }
};
