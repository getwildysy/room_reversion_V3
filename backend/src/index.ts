import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import classroomRoutes from "./routes/classroomRoutes";
import authRoutes from "./routes/authRoutes"; // <-- 1. 檢查是否 "匯入" 了 authRoutes
import reservationRoutes from "./routes/reservationRoutes";

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

app.listen(PORT, () => {
  console.log(`[Server] 伺服器正在監聽 http://localhost:${PORT}`);
});
