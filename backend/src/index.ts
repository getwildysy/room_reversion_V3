// backend/src/index.ts

import express from "express";
import cors from "cors"; // 1. 匯入 cors
import classroomRoutes from "./routes/classroomRoutes"; // 2. 匯入教室路由

const app = express();
const PORT = process.env.PORT || 3001;

// --- 中間件 (Middleware) ---
app.use(cors()); // 3. 啟用 CORS (允許所有來源，方便開發)
app.use(express.json()); // 讓 Express 可以解析 JSON 格式的請求

// --- 路由 (Routes) ---
app.get("/api", (req, res) => {
  res.json({ message: "後端伺服器運作中！" });
});

// 4. 掛載教室管理的 API 路由
// 所有 /api/classrooms 開頭的請求，都交給 classroomRoutes 處理
app.use("/api/classrooms", classroomRoutes);

app.listen(PORT, () => {
  console.log(`[Server] 伺服器正在監聽 http://localhost:${PORT}`);
});
