// backend/src/controllers/reservationController.ts

import { Request, Response } from "express";
import db from "../db";
import { Knex } from "knex";

// 預約資料的請求 body 型別
interface ReservationBody {
  classroomId: number;
  purpose: string;
  slots: Array<{
    date: string; // "YYYY-MM-DD"
    timeSlot: string; // "第一節"
  }>;
}

// GET /api/reservations?classroomId=1
// 取得所有預約 (或依 classroomId 篩選)
export const getReservations = async (req: Request, res: Response) => {
  try {
    const { classroomId } = req.query;

    let query = db("reservations")
      .join("users", "reservations.user_id", "users.id")
      .select(
        "reservations.id",
        "reservations.classroom_id as classroomId",
        "reservations.user_id as userId",
        "nickname as userNickname", // 我們從 users 表取得 userName
        "reservations.purpose",
        "reservations.date",
        "reservations.time_slot as timeSlot",
      );

    if (classroomId) {
      query = query.where("reservations.classroom_id", Number(classroomId));
    }

    const reservations = await query;
    res.json(reservations);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error fetching reservations", error: err.message });
  }
};

// GET /api/reservations/my (取得 "我" 的預約)
export const getMyReservations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // 從 authenticateToken 取得登入者的 ID

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const reservations = await db("reservations")
      .join("classrooms", "reservations.classroom_id", "classrooms.id")
      .where({ "reservations.user_id": userId })
      .select(
        "reservations.id",
        "classrooms.name as classroomName", // 顯示教室名稱
        "reservations.purpose",
        "reservations.date",
        "reservations.time_slot as timeSlot",
      )
      .orderBy("date", "desc");

    res.json(reservations);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error fetching my reservations", error: err.message });
  }
};

// POST /api/reservations (建立新預約)
export const createReservation = async (req: Request, res: Response) => {
  const userId = req.user?.id; // 取得登入者的 ID
  const { classroomId, purpose, slots } = req.body as ReservationBody;

  if (!userId || !classroomId || !purpose || !slots || slots.length === 0) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  // 使用 Knex 的 "Transaction" (交易)
  // 確保 "所有" 時段都成功，或 "所有" 都失敗，避免資料不一致
  const trx = await db.transaction();
  try {
    const newReservations = [];
    for (const slot of slots) {
      const { date, timeSlot } = slot;

      const [newRes] = await trx("reservations")
        .insert({
          user_id: userId,
          classroom_id: classroomId,
          purpose: purpose,
          date: date,
          time_slot: timeSlot,
        })
        .returning("*");

      newReservations.push(newRes);
    }

    // 如果所有 insert 都成功，提交交易
    await trx.commit();
    res.status(201).json({
      message: "Reservations created successfully.",
      reservations: newReservations,
    });
  } catch (err: any) {
    // 如果中途有任何錯誤 (例如時段已被預約，觸發 unique 限制)
    // 復原所有已執行的操作
    await trx.rollback();

    if (err.message.includes("UNIQUE constraint failed")) {
      res.status(409).json({
        message: "Error: One or more selected time slots are already booked.",
      });
    } else {
      res
        .status(500)
        .json({ message: "Error creating reservation", error: err.message });
    }
  }
};

// DELETE /api/reservations/:id (刪除預約)
export const deleteReservation = async (req: Request, res: Response) => {
  try {
    const reservationId = Number(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const reservation = await db("reservations")
      .where({ id: reservationId })
      .first();

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    // 權限檢查：必須是管理者 (admin) 或 預約者本人 (user_id === userId)
    if (userRole === "admin" || reservation.user_id === userId) {
      await db("reservations").where({ id: reservationId }).del();
      res.status(204).send(); // 成功刪除，回傳 No Content
    } else {
      res.status(403).json({
        message:
          "Forbidden: You do not have permission to delete this reservation.",
      });
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error deleting reservation", error: err.message });
  }
};
