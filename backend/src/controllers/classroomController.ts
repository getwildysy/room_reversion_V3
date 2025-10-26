// backend/src/controllers/classroomController.ts

import { Request, Response } from "express";
import db from "../db"; // 匯入我們的 knex 實例

// 處理型別 (對應到我們資料庫的欄位)
interface ClassroomBody {
  name: string;
  capacity: number;
  color: string;
}

// GET /api/classrooms (Read)
// 取得所有教室列表 (這個開放給所有人)
export const getAllClassrooms = async (req: Request, res: Response) => {
  try {
    const classrooms = await db("classrooms").select("*").orderBy("id");
    res.json(classrooms);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error fetching classrooms", error: err.message });
  }
};

// POST /api/classrooms (Create)
// 新增一間教室 (限管理者)
export const createClassroom = async (req: Request, res: Response) => {
  try {
    const { name, capacity, color } = req.body as ClassroomBody;

    if (!name || capacity == null || !color) {
      return res
        .status(400)
        .json({ message: "Missing required fields: name, capacity, color" });
    }

    // .returning('*') 讓我們能取回剛新增的資料
    const [newClassroom] = await db("classrooms")
      .insert({ name, capacity, color })
      .returning("*");
    res.status(201).json(newClassroom);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error creating classroom", error: err.message });
  }
};

// PUT /api/classrooms/:id (Update)
// 更新一間教室 (限管理者)
export const updateClassroom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, capacity, color } = req.body as ClassroomBody;

    if (!name || capacity == null || !color) {
      return res
        .status(400)
        .json({ message: "Missing required fields: name, capacity, color" });
    }

    const [updatedClassroom] = await db("classrooms")
      .where({ id })
      .update({ name, capacity, color })
      .returning("*");

    if (updatedClassroom) {
      res.json(updatedClassroom);
    } else {
      res.status(404).json({ message: "Classroom not found" });
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error updating classroom", error: err.message });
  }
};

// DELETE /api/classrooms/:id (Delete)
// 刪除一間教室 (限管理者)
export const deleteClassroom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // .del() 會回傳被刪除的筆數
    const count = await db("classrooms").where({ id }).del();

    if (count > 0) {
      res.status(204).send(); // 204 No Content，表示成功刪除
    } else {
      res.status(404).json({ message: "Classroom not found" });
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error deleting classroom", error: err.message });
  }
};
