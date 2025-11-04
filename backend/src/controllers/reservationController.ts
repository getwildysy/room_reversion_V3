// backend/src/controllers/reservationController.ts
import { Request, Response } from "express";
import db from "../db";
import { Knex } from "knex";
import crypto from "crypto";

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
        "reservations.batch_id",
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

// POST /api/reservations/batch - 建立批次預約 (限管理者)
export const createBatchReservation = async (req: Request, res: Response) => {
  const adminUserId = req.user?.id;
  const {
    classroomId,
    purpose,
    startDate, // "YYYY-MM-DD"
    endDate, // "YYYY-MM-DD"
    timeSlots, // ["第一節", "第二節"]
    weekdays, // [0, 6] (0=週日, 6=週六)
  } = req.body;

  if (
    !classroomId ||
    !purpose ||
    !startDate ||
    !endDate ||
    !timeSlots ||
    !weekdays
  ) {
    return res.status(400).json({ message: "缺少必要的欄位。" });
  }
  if (!adminUserId) {
    return res.status(401).json({ message: "管理者未登入。" });
  }

  const batchId = crypto.randomUUID(); // 產生一個唯一的批次 ID
  const reservationsToCreate: any[] = [];
  const conflictsCheck: any[] = [];

  try {
    // --- 1. 產生所有日期和時段 ---
    const start = new Date(startDate);
    const end = new Date(endDate);
    let current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay(); // 0 (週日) - 6 (週六)

      // 檢查是否為被排除的星期
      if (weekdays.includes(dayOfWeek)) {
        const dateString = `${current.getFullYear()}-${(current.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${current.getDate().toString().padStart(2, "0")}`;

        for (const timeSlot of timeSlots) {
          reservationsToCreate.push({
            user_id: adminUserId, // 預約者/鎖定者 設為當前管理員
            classroom_id: classroomId,
            purpose: purpose, // 例如："系統鎖定" 或 "期中考試"
            date: dateString,
            time_slot: timeSlot,
            batch_id: batchId,
          });
          conflictsCheck.push([dateString, timeSlot]);
        }
      }
      // 前往下一天
      current.setDate(current.getDate() + 1);
    }

    if (reservationsToCreate.length === 0) {
      return res
        .status(400)
        .json({ message: "在指定的日期範圍內，沒有可預約的時段。" });
    }

    // --- 2. 檢查衝突 (一次性檢查) ★ (這是你要求的提示功能) ★ ---
    const existingReservations = await db("reservations")
      .where({ classroom_id: classroomId })
      .whereIn(["date", "time_slot"], conflictsCheck)
      .join("users", "reservations.user_id", "users.id")
      .select(
        "reservations.date",
        "reservations.time_slot as timeSlot",
        "users.nickname as userNickname",
      );

    if (existingReservations.length > 0) {
      // 發現衝突，回傳衝突的時段給管理者
      return res.status(409).json({
        message: "無法建立批次鎖定，因為以下時段已被預約：",
        conflicts: existingReservations,
      });
    }

    // --- 3. 執行批次新增 (使用交易) ---
    await db.transaction(async (trx) => {
      await trx("reservations").insert(reservationsToCreate);
    });

    res.status(201).json({
      message: `批次鎖定成功！總共鎖定了 ${reservationsToCreate.length} 筆時段。`,
      batchId,
    }); // ★ 4. 修改提示文字
  } catch (err: any) {
    console.error("Error creating batch reservation:", err);
    res
      .status(500)
      .json({ message: "建立批次鎖定時發生伺服器錯誤", error: err.message });
  }
};

// DELETE /api/reservations/batch/:batch_id - 批次取消預約 (限管理者)
export const deleteBatchReservation = async (req: Request, res: Response) => {
  const { batch_id } = req.params;

  try {
    const count = await db("reservations").where({ batch_id: batch_id }).del();

    if (count === 0) {
      return res.status(404).json({ message: "找不到此批次 ID 的預約紀錄。" });
    }

    res
      .status(200)
      .json({ message: `批次預約已成功取消，共刪除了 ${count} 筆預約。` });
  } catch (err: any) {
    console.error("Error deleting batch reservation:", err);
    res
      .status(500)
      .json({ message: "取消批次預約時發生伺服器錯誤", error: err.message });
  }
};

// GET /api/reservations/export - 匯出預約紀錄 (限管理者)
export const exportReservations = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, classroomId } = req.query as {
      startDate: string;
      endDate: string;
      classroomId: string; // 'all' 或 教室 ID
    };

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "必須提供開始日期和結束日期。" });
    }

    // 1. 建立 Knex 查詢
    let query = db("reservations")
      .join("users", "reservations.user_id", "users.id")
      .join("classrooms", "reservations.classroom_id", "classrooms.id")
      .where("reservations.date", ">=", startDate)
      .where("reservations.date", "<=", endDate)
      .select(
        "reservations.date",
        "reservations.time_slot",
        "classrooms.name as classroomName",
        "users.nickname as userNickname",
        "reservations.purpose",
      )
      .orderBy("reservations.date", "asc")
      .orderBy("reservations.time_slot", "asc");

    // 2. 處理特定教室篩選
    if (classroomId && classroomId !== "all") {
      query = query.where("reservations.classroom_id", Number(classroomId));
    }

    const records: any[] = await query;

    // 3. 將 JSON 轉換為 CSV 字串
    if (records.length === 0) {
      return res
        .status(404)
        .json({ message: "在指定範圍內找不到任何預約紀錄。" });
    }

    const csvHeader = '"日期","時段","教室","借用人(暱稱)","事由"\n';
    const csvBody = records
      .map(
        (row) =>
          `"${row.date}","${row.time_slot}","${row.classroomName}","${
            row.userNickname
          }","${row.purpose.replace(/"/g, '""')}"`,
      )
      .join("\n");

    const csvData = "\uFEFF" + csvHeader + csvBody;

    // 4. 設定 HTTP 標頭，強制瀏覽器下載
    // 加上 'charset=utf-8-sig' 是為了讓 Excel 正確開啟 UTF-8 (包含中文)
    res.header("Content-Type", "text/csv; charset=utf-8-sig");
    res.header(
      "Content-Disposition",
      `attachment; filename="reservations_${startDate}_to_${endDate}.csv"`,
    );

    // 5. 回傳 CSV 檔案
    res.status(200).send(csvData);
  } catch (err: any) {
    console.error("Error exporting reservations:", err);
    res
      .status(500)
      .json({ message: "匯出時發生伺服器錯誤", error: err.message });
  }
};
