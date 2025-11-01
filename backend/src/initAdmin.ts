import db from "./db";
import bcrypt from "bcryptjs";

export const initializeAdminAccount = async () => {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  // 1. 檢查 .env 中是否有設定
  if (!username || !password) {
    console.warn(
      "[Server] ADMIN_USERNAME 或 ADMIN_PASSWORD 未在 .env 中設定。跳過自動建立管理員。",
    );
    return;
  }

  try {
    // 2. 檢查資料庫中是否 "已經存在" 該使用者
    const existingAdmin = await db("users")
      .where({ username: username })
      .first();

    if (existingAdmin) {
      console.log(`[Server] 管理員帳號 '${username}' 已經存在，無需建立。`);
      return;
    }

    // 3. 如果不存在，則建立新帳號
    console.log(`[Server] 找不到管理員帳號 '${username}'。正在建立...`);

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await db("users").insert({
      username: username,
      password_hash: password_hash,
      role: "admin",
      status: "active", // ★ 自動設為 'active' (已啟用)
      nickname: "系統管理員",
    });

    console.log(`[Server] 預設管理員 '${username}' 建立成功。`);
  } catch (error) {
    console.error("[Server] 自動建立管理員時發生錯誤:", error);
  }
};
