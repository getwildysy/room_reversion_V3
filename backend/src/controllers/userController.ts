import { Request, Response } from "express";
import db from "../db";
import { User } from "./authController"; // 我們可以重用在 authController 定義的 User 介面

// GET /api/users - 取得所有使用者列表 (限管理者)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // ★ 安全性：絕對不能回傳 password_hash
    const users = await db("users")
      .select("id", "username", "role")
      .orderBy("id");
    res.json(users);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
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

// DELETE /api/users/:id - 刪除使用者 (限管理者)
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
