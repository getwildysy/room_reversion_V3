import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { initializeAdminAccount } from "./initAdmin";
import classroomRoutes from "./routes/classroomRoutes";
import authRoutes from "./routes/authRoutes"; // <-- 1. 檢查是否 "匯入" 了 authRoutes
import reservationRoutes from "./routes/reservationRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();
const PORT = process.env.PORT || 3001;

// --- 中間件 (Middleware) ---
app.use(cors());
app.use(express.json());

// --- 路由 (Routes) ---
app.get("/api", (req, res) => {
  res.json({ message: "後端伺服器運作中！" });
});

// 掛載路由
app.use("/api/classrooms", classroomRoutes);
app.use("/api/auth", authRoutes); // <-- 2. 檢查是否 "使用" 了 authRoutes 並掛載在 /api/auth
app.use("/api/reservations", reservationRoutes);
app.use("/api/users", userRoutes);

const startServer = async () => {
  try {
    // 3. ★ 啟動伺服器前，先執行管理員初始化 ★
    //    (這會檢查 .env 並在需要時建立 admin)
    await initializeAdminAccount();

    // 4. 初始化完成後，才開始監聽
    app.listen(PORT, () => {
      console.log(`[Server] 伺服器正在監聽 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("[Server] 伺服器啟動失敗:", error);
    process.exit(1); // 啟動失敗時退出
  }
};

startServer();

app.listen(PORT, () => {
  console.log(`[Server] 伺服器正在監聽 http://localhost:${PORT}`);
});
