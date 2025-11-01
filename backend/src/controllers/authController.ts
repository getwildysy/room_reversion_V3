// backend/src/controllers/authController.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db"; // 我們的 Knex 資料庫實例
import { Knex } from "knex";

// --- ★★★ 重要的安全性設定 ★★★ ---
// 這個密鑰(secret)是用來簽名和驗證 JWT 的。

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "[Server] FATAL ERROR: JWT_SECRET is not defined in .env file",
  );
}
// ---------------------------------

// 我們手動定義 User 型別，以匹配 'users' 資料表

// 取得 users 資料表型別 (雖然 Knex 會自動處理，但這樣寫更清晰)
// type User = Knex.Tables["users"];

export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: "user" | "admin"; // 角色可以是 'user' 或是 'admin'
  created_at: string; // knex 預設會回傳時間戳的字串
  updated_at: string;
}

// POST /api/auth/register (註冊)
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    // 檢查使用者名稱是否已被使用
    const existingUser = await db("users").where({ username }).first();
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists." });
    }

    // 將密碼進行雜湊處理
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 建立新使用者 (我們在此階段先不處理 'admin' 角色)
    const [newUser] = await db("users")
      .insert({
        username,
        password_hash,
        role: "user", // 預設所有註冊者都是一般 'user'
      })
      .returning(["id", "username", "role"]);

    res
      .status(201)
      .json({ message: "User registered successfully.", user: newUser });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};

// POST /api/auth/login (登入)
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    // 1. 尋找使用者
    const user: User | undefined = await db("users")
      .where({ username })
      .first();
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." }); // 故意使用模糊訊息
    }

    // 2. 驗證密碼
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." }); // 故意使用模糊訊息
    }

    // 3. 產生 JWT
    // Token 中儲存的資料 (payload)
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    // 簽發 Token，設定 1 小時後過期
    const token = jwt.sign(
      payload,
      JWT_SECRET, // <-- 現在這裡使用的是安全的變數
      { expiresIn: "1h" },
    );

    // 4. 回傳 Token
    res.json({
      message: "Login successful!",
      token: token,
      user: payload, // 同時回傳使用者資訊，方便前端使用
    });
  } catch (err: any) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};
