# 專科教室借用系統 (Full-Stack Edition)

這是一個功能完整的全端「專科教室借用系統」，從一個 React 前端介面逐步擴展而來。系統包含獨立的後端 API、資料庫、使用者認證、管理者權限，並最終使用 Docker 容器化部署。

## ✨ 主要功能

- **使用者認證**：使用者可以註冊新帳號並登入系統。
- **教室瀏覽**：以日曆形式查看所有教室的預約狀態。
- **教室預約**：登入的使用者可以選取多個時段以預約教室。
- **管理後台**：管理者 (`admin` 角色) 擁有專屬後台，可以對教室進行**新增 (Create)、讀取 (Read)、更新 (Update)、刪除 (Delete)** 等操作。
- **容器化**：整個應用程式（前端 + 後端）已被打包到 Docker 容器中，可使用 Docker Compose 一鍵啟動。

## 🚀 技術堆疊

- **前端 (Frontend)**:
  - React 19
  - TypeScript
  - Vite (建置工具)
  - React Router (路由管理)
  - Axios (API 請求)
  - Tailwind CSS (UI 樣式)
- **後端 (Backend)**:
  - Node.js
  - Express.js (API 框架)
  - TypeScript
  - Knex.js (SQL 查詢構建器)
  - SQLite3 (資料庫)
  - JWT (JSON Web Tokens) (身分驗證)
  - Bcrypt.js (密碼雜湊)
- **部署 (Deployment)**:
  - Docker
  - Docker Compose
  - Nginx (作為前端的靜態檔案伺服器與 API 反向代理)

---

## 🏃‍♂️ 執行專案 (兩種模式)

你有兩種方式可以執行此專案：

### 模式一：生產模式 (使用 Docker Compose)

這是**推薦**的執行方式，它會模擬真實的上線環境，一鍵啟動所有服務。

**前提：** 你的電腦必須安裝 Docker Desktop。

**1. 首次設定 (Frontend)**

- 確保 `frontend/api.ts` 檔案中的 `API_URL` 是指向相對路徑：
  ```typescript
  // frontend/api.ts
  const API_URL = "/api"; // 正確 (用於 Docker)
  // const API_URL = 'http://localhost:3001/api'; // 錯誤 (用於開發)
  ```

**2. 首次設定 (Backend)**

- 確保 `backend/db` 資料夾存在 (如果不存在，請手動建立)。Docker 需要這個資料夾來掛載資料庫。
  ```bash
  mkdir -p backend/db
  ```

**3. 首次設定 (根目錄)**

- 在專案的**根目錄** (與 `docker-compose.yml` 同層) 建立一個 `.env` 檔案。
- 這個檔案**絕對不能** commit 到 Git。
- 在 `.env` 檔案中加入你的密鑰：
  ```
  JWT_SECRET=你設定的超級安全的隨機密鑰
  ```

**4. 啟動服務**

- 在專案的**根目錄**終端機中執行：
  ```bash
  docker compose up --build
  ```
- 加上 `-d` 可以在背景執行：`docker compose up --build -d`

**5. 訪問系統**

- 打開瀏覽器，前往： `http://localhost:3000`

---

### 模式二：開發模式 (雙伺服器)

此模式適用於開發新功能，它提供熱重載 (Hot Reload) 功能。

**前提：** 你的電腦必須安裝 Node.js (v18+)。

**1. 首次設定 (Frontend)**

- 確保 `frontend/api.ts` 檔案中的 `API_URL` 是指向後端開發伺服器：
  ```typescript
  // frontend/api.ts
  // const API_URL = '/api'; // 錯誤 (用於 Docker)
  const API_URL = "http://localhost:3001/api"; // 正確 (用於開發)
  ```

**2. 啟動後端 (Backend) 伺服器**

- **終端機 A**:

  ```bash
  cd backend
  npm install

  # 建立後端 .env 檔案
  # (注意：開發模式的 .env 在 backend 資料夾內)
  nano .env
  # (貼上 JWT_SECRET=你設定的超級安全的隨機密鑰)

  # 首次執行：初始化資料庫
  npx knex migrate:latest --knexfile knexfile.ts

  # 啟動後端開發伺服器
  npm run dev
  ```

- _(後端將運行在 `http://localhost:3001`)_

**3. 啟動前端 (Frontend) 伺服器**

- **終端機 B**:
  ```bash
  cd frontend
  npm install

  # 啟動前端開發伺服器
  npm run dev
  ```
- _(前端將運行在 `http://localhost:3000`)_

**4. 訪問系統**

- 打開瀏覽器，前往： `http://localhost:3000`

---

## 🔑 如何設定第一位管理員 (Admin)

本系統**沒有**預設管理員帳號，你需要手動將一位使用者升級。

1.  **註冊帳號**：

    - (無論是開發模式或 Docker 模式) 打開瀏覽器 `http://localhost:3000`。
    - 切換到「註冊」頁籤，註冊一個新帳號 (例如：使用者名稱 `admin`，密碼 `admin123`)。

2.  **停止應用程式**：

    - **Docker 模式**：在終端機按下 `Ctrl+C` (或執行 `docker compose down`)。
    - **開發模式**：停止 `backend` 伺服器 (終端機 A 按下 `Ctrl+C`)。

3.  **修改資料庫**：

    - 資料庫檔案位於 `backend/db/dev.sqlite3`。
    - 使用 `sqlite3` 指令列工具 (推薦) 或 `DB Browser for SQLite` (圖形化工具) 開啟它。

    **使用 `sqlite3` 指令列 (在 `backend/db` 資料夾執行)：**

    ```bash
    # 1. 開啟資料庫
    sqlite3 dev.sqlite3

    # 2. 執行 SQL 更新指令 (將 'your_username' 換成你註冊的帳號)
    sqlite> UPDATE users SET role = 'admin' WHERE username = 'your_username';

    # 3. 退出
    sqlite> .quit
    ```

4.  **重新啟動應用程式**：

    - **Docker 模式**：執行 `docker compose up`。
    - **開發模式**：執行 `npm run dev` (僅需重啟後端)。

5.  **完成**！
    - 現在用你升級的帳號登入，你將會看到「管理後台」按鈕，並可以開始新增教室。
