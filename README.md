# 專科教室借用系統 (Full-Stack Edition)

這是一個功能完整的全端「專科教室借用系統」，從一個 React 前端介面逐步擴展而來。系統包含獨立的後端 API、資料庫、使用者認證、管理者權限，並最終使用 Docker 容器化部署。

## ✨ 主要功能

- **使用者認證**：
  - 使用者註冊 (需填寫使用者名稱、密碼、暱稱)。
  - 使用者登入 (使用 JWT Token 認證)。
- **註冊審核**：
  - 新註冊的使用者預設為 `pending` (待審核)。
  - 管理員必須在後台「批准」帳號後，該帳號才能登入。
- **個人化介面**：
  - 系統在頁首 (Header) 和預約日曆上，皆顯示使用者的「暱稱」。
- **教室瀏覽**：
  - 以日曆形式查看所有教室的預約狀態。
- **預約管理**：
  - 已啟用的使用者可以選取多個時段以預約教室。
  - 使用者可以從日曆介面點擊並**取消自己**的預約。
- **管理後台 (`/admin`)**：
  - 管理者 (`admin` 角色) 擁有專屬的 `/admin` 頁面。
  - **使用者審核**：批准或拒絕新註冊的 `pending` 使用者。
  - **使用者管理**：
    - 建立新使用者 (可指定角色與暱稱)。
    - 讀取所有「已啟用」的使用者列表。
    - 更新使用者 (修改角色、修改暱稱)。
    - 重設使用者密碼。
    - 刪除使用者。
  - **教室管理**：
    - 建立、讀取、更新、刪除 (CRUD) 教室資訊。
  - **報表匯出**：
    - 可依「日期區間」和「特定教室」篩選，將預約紀錄匯出為 `.csv` 檔案。
- **進階預約控制 (限管理員)**：
  - **取消任意預約**：管理者可以從日曆介面點擊並**取消任何人**的預約。
  - **批次鎖定**：
    - 可指定「教室」、「日期區間」、「星期幾」和「時段」。
    - 系統會自動將所有符合條件的時段鎖定（例如：鎖定 `2025/11/02` 到 `2026/01/30` 期間，每個`禮拜二`的`第一節`）。
    - 如果範圍內有時段已被預約，系統會提示衝突並中止操作。
  - **批次取消**：
    - 管理者點擊任一「批次鎖定」的時段時，系統會詢問要「取消單筆」還是「取消整個批次」。
- **自動化**：
  - 系統啟動時，會自動檢查 `.env` 檔案，並自動建立預設的管理員帳號 (若不存在)。
- **容器化**：
  - 整個應用程式（前端 + 後端）已被打包到 Docker 容器中，可使用 Docker Compose 一鍵啟動。

## 🚀 技術堆疊

- **前端 (Frontend)**: React, TypeScript, Vite, React Router, Axios, Tailwind CSS
- **後端 (Backend)**: Node.js, Express.js, TypeScript, Knex.js, SQLite3, JWT, Bcrypt.js
- **部署 (Deployment)**: Docker, Docker Compose, Nginx

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
  ```

**2. 首次設定 (根目錄 .env)**

- 在專案的**根目錄** (與 `docker-compose.yml` 同層) 建立一個 `.env` 檔案。
- 這個檔案**絕對不能** commit 到 Git。
- 在 `.env` 檔案中貼上以下內容，並**修改成你自己的設定**：

  ```
  # (必要) 用來簽署 JWT 的密鑰，請使用一長串隨機字元
  JWT_SECRET=my-super-strong-and-random-secret-key-123456789

  # (必要) 預設管理員帳號
  # 在資料庫為空時，系統將 "自動建立" 此帳號
  ADMIN_USERNAME=admin
  ADMIN_PASSWORD=admin123
  ```

**3. 啟動服務**

- 在專案的**根目錄**終端機中執行：
  ```bash
  docker compose up --build
  ```
- (伺服器在啟動時，會自動讀取 `.env` 並建立 `admin` 帳號)
- 加上 `-d` 可以在背景執行：`docker compose up --build -d`

**4. 訪問系統**

- 打開瀏覽器，前往： `http://localhost:3000`
- 你現在可以直接使用 `.env` 中設定的 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 登入。

---

### 模式二：開發模式 (雙伺服器)

此模式適用於開發新功能，它提供熱重載 (Hot Reload) 功能。

**前提：** 你的電腦必須安裝 Node.js (v18+)。

**1. 首次設定 (Frontend)**

- 確保 `frontend/api.ts` 檔案中的 `API_URL` 是指向後端開發伺服器：
  ```typescript
  // frontend/api.ts
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
  ```

  - 在 `backend/.env` 中貼上**與根目錄 .env 相同的內容**：

  ```
  JWT_SECRET=my-super-strong-and-random-secret-key-123456789
  ADMIN_USERNAME=admin
  ADMIN_PASSWORD=admin123
  ```

  ```bash
  # 首次執行或資料庫不同步時：刪除舊資料庫並重新遷移
  # (Windows 使用 del, macOS/Linux 使用 rm)
  del db\dev.sqlite3
  npx knex migrate:latest --knexfile knexfile.ts

  # 啟動後端開發伺服器 (它會自動讀取 .env 並建立 admin)
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
- 你可以直接使用 `backend/.env` 中設定的帳號密碼登入。

---

## 🔑 系統管理員帳號

**本系統現在會自動建立預設管理員！**

你**不再需要**手動進入資料庫修改。

1.  **開啟**專案**根目錄**的 `.env` 檔案 (用於 Docker) 或 `backend/.env` 檔案 (用於開發模式)。
2.  設定 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 的值。
3.  **刪除** `backend/db/dev.sqlite3` 資料庫檔案 (如果你想強制重建)。
4.  **啟動**伺服器 (`docker compose up --build` 或 `npm run dev`)。
5.  伺服器在啟動時會自動檢查，如果該管理員不存在，就會用 `active` (已啟用) 和 `admin` (管理員) 身分建立此帳號。

## 🌳 Git 開發流程

我們採用「功能分支 (Feature Branch)」的工作流程。**請勿**直接 commit 到 `main` 分支。

**開發新功能 SOP：**

1.  **更新主線**：
    ```bash
    git checkout main
    git pull origin main
    ```
2.  **建立新分支**：
    ```bash
    # (例如：開發新功能)
    git checkout -b feature/my-new-feature
    ```
3.  **開發與提交**：
    - (切換到「開發模式」開始修改程式碼)
    - `git add .`
    - `git commit -m "feat: 完成...功能"`
4.  **合併回主線**：
    - (當功能開發/測試完畢)
    - `git checkout main`
    - `git merge feature/my-new-feature`
5.  **清理分支**：
    ```bash
    git branch -d feature/my-new-feature
    ```
