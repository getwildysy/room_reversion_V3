// backend/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// 取得我們在 authController 中定義的 JWT_SECRET
// 理想情況下，這應該來自同一個 .env 檔案
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "[Server] FATAL ERROR: JWT_SECRET is not defined in .env file",
  );
}

// 這是我們從 JWT payload 解碼出來的使用者資訊
interface UserPayload {
  id: number;
  username: string;
  role: "user" | "admin";
}

// 替 Express 的 Request 介面 "擴充" 一個可選的 user 屬性
// 這樣 TypeScript 就不會抱怨 req.user 不存在
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
  // 從 request header 取得 token
  // 格式會是 "Bearer YOUR_TOKEN_STRING"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // 取得 " " 後面的 token 字串

  if (token == null) {
    // 401 Unauthorized (未授權)
    return res.status(401).json({ message: "Access token required." });
  }

  // 驗證 token
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    // <-- 現在這裡使用的是安全的變數
    if (err) {
      // 403 Forbidden (權杖無效或過期)
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // 將解碼後的使用者資訊 (payload) 存入 req.user
    // 我們只關心 payload 中的 user 物件
    req.user = user as UserPayload;

    // 進入下一個中間件或路由處理函式
    next();
  });
};

// 2. 檢查是否為管理者的中間件
// ★★★ 這個中間件 "必須" 在 authenticateToken "之後" 使用 ★★★
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // 此時 req.user 應該已經被 authenticateToken 填入了
  console.log(`[AuthMiddleware] isAdmin Check: req.user is:`, req.user);
  console.log(
    `[AuthMiddleware] isAdmin Check: req.user.role is: '${req.user?.role}'`,
  );

  if (req.user && req.user.role === "admin") {
    next(); // 是管理者，放行
  } else {
    // 403 Forbidden (權限不足)
    res.status(403).json({ message: "Forbidden: Admin access required." });
  }
};
