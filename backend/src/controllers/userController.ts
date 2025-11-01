import { Request, Response } from "express";
import db from "../db";
import { User } from "./authController"; // 我們可以重用在 authController 定義的 User 介面
import bcrypt from "bcryptjs";

// GET /api/users - 取得所有使用者列表 (限管理者)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // ★ 安全性：絕對不能回傳 password_hash
    // ★★★ 修改：只顯示 'active' 的使用者 ★★★
    const users = await db("users")
      .where({ status: "active" }) // <-- 修改點
      .select("id", "username", "role")
      .orderBy("id");
    res.json(users);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
};

// --- ★★★ 新增：GET /api/users/pending - 取得 "待審核" 使用者列表 ★★★ ---
export const getPendingUsers = async (req: Request, res: Response) => {
  try {
    const users = await db("users")
      .where({ status: "pending" })
      .select("id", "username", "role")
      .orderBy("created_at");
    res.json(users);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error fetching pending users", error: err.message });
  }
};

// --- ★★★ 新增：PUT /api/users/:id/approve - 批准使用者 ★★★ ---
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [approvedUser] = await db("users")
      .where({ id })
      .update({
        status: "active",
      })
      .returning(["id", "username", "role", "status"]);

    if (approvedUser) {
      res.json(approvedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error approving user", error: err.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res
        .status(400)
        .json({ message: "Username, password, and role are required." });
    }
    if (role !== "admin" && role !== "user") {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    // 檢查使用者名稱是否已被使用
    const existingUser = await db("users").where({ username }).first();
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists." });
    }

    // 雜湊密碼
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 建立新使用者
    const [newUser] = await db("users")
      .insert({
        username,
        password_hash,
        role: role,
      })
      .returning(["id", "username", "role"]);

    res.status(201).json(newUser);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
};

// PUT /api/users/:id/role - 更新使用者角色 (限管理者)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || (role !== "admin" && role !== "user")) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    // 防止管理者不小心移除自己的管理權限 (如果他是唯一管理員)
    if (Number(id) === req.user?.id) {
      return res.status(403).json({ message: "Cannot change your own role." });
    }

    const [updatedUser] = await db("users")
      .where({ id })
      .update({ role })
      .returning(["id", "username", "role"]);

    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error updating user role", error: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    // 雜湊新密碼
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const count = await db("users").where({ id }).update({ password_hash });

    if (count > 0) {
      res.status(200).json({ message: "Password reset successfully." });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error resetting password", error: err.message });
  }
};

// DELETE /api/users/:id - 刪除使用者 (限管理者)
// 注意：deleteUser 現在也可用於 "拒絕" 待審核的使用者
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 防止管理者刪除自己
    if (Number(id) === req.user?.id) {
      return res.status(403).json({ message: "Cannot delete yourself." });
    }

    const count = await db("users").where({ id }).del();

    if (count > 0) {
      res.status(204).send(); // 成功刪除
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
};
