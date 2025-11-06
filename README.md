# 專科教室借用系統 (Full-Stack Edition)

這是一個功能完整的全端「專科教室借用系統」，使用 React/TypeScript (前端) 和 Node.js/Express (後端) 開發，並使用 Docker 容器化部署。

## ✨ 核心功能

- **使用者系統**：
  - 使用者註冊 (需填寫使用者名稱、密碼、暱稱)。
  - 註冊審核流程：新帳號預設為 `pending`，需由管理員批准後才能登入。
  - JWT Token 認證：登入過期時會自動提示並導向登入頁。
- **一般使用者**：
  - 以日曆形式查看所有教室的預約狀態 (顯示預約者暱稱)。
  - 選取單一或多個時段進行預約。
  - 可點擊日曆上的預約，取消**自己**的預約。
- **管理員後台 (`/admin`)**：
  - **使用者審核**：批准或拒絕新註冊的 `pending` 使用者。
  - **使用者管理**：建立、讀取、更新 (角色/暱稱)、重設密碼、刪除「已啟用」的使用者。
  - **教室管理**：建立、讀取、更新、刪除 (CRUD) 教室資訊。
  - **報表匯出**：可依「日期區間」和「特定教室」篩選，將預約紀錄匯出為 `.csv` 檔案 (Excel 可正常開啟)。
  - **批次鎖定**：可指定教室、日期區間、星期幾和時段，將系統時段鎖定 (例如「考試週」或「系統維護」)。
  - **批次取消**：可一鍵取消整個批次的鎖定，或僅取消批次中的單筆鎖定。

## 🚀 技術堆疊

- **前端**: React, TypeScript, Vite, React Router, Axios, Tailwind CSS, `react-hot-toast`
- **後端**: Node.js, Express.js, TypeScript, Knex.js, SQLite3, JWT, Bcrypt.js
- **部署**: Docker, Docker Compose, Nginx

---

## 🏃‍♂️ 快速啟動 (生產模式 - Docker)

這是推薦給**一般使用者**或**伺服器部署**的方式，一鍵啟動所有服務。

**前提：** 您的電腦必須安裝 Docker Desktop。

### 1. 準備設定檔

**A. 設定前端 API 路徑**

- 確保 `frontend/api.ts` 檔案中的 `API_URL` 是指向相對路徑：
  ```typescript
  // frontend/api.ts
  const API_URL = "/api"; // 確保是這一行 (用於 Docker)
  ```

**B. 建立根目錄 .env 檔案**

- 在專案的**根目錄** (與 `docker-compose.yml` 同層) 建立一個 `.env` 檔案。
- 這個檔案**不會**被 commit 到 Git。
- 在 `.env` 檔案中貼上以下內容，並**修改成您自己的設定**：

  ```
  # (必要) 用來簽署 JWT 的密鑰，請使用一長串隨機字元
  JWT_SECRET=my-super-strong-and-random-secret-key-123456789

  # (必要) 預設管理員帳號
  # 在資料庫為空時，系統將 "自動建立" 此帳號
  ADMIN_USERNAME=
  ADMIN_PASSWORD=
  ```

### 2. 啟動服務

1.  在專案的**根目錄**開啟終端機。
2.  **首次啟動**或**更新程式碼**後，請執行「建置 (build)」：

    ```bash
    docker compose up --build -d
    ```

    _( `-d` 讓容器在背景執行)_

3.  （未來若要**重新啟動**，只需執行）：
    ```bash
    docker compose up -d
    ```

### 3. 訪問系統

- 打開瀏覽器，前往： `http://localhost:3000`
- 您現在可以直接使用 `.env` 中設定的 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 登入。

---

## 💻 本地開發 (開發者模式)

此模式適用於**開發新功能**，它提供熱重載 (Hot Reload) 功能。

**前提：** 您的電腦必須安裝 Node.js (v18+)。

### 1. 準備設定檔

**A. 設定前端 API 路徑**

- 確保 `frontend/api.ts` 檔案中的 `API_URL` 是指向後端開發伺服器：
  ```typescript
  // frontend/api.ts
  const API_URL = "http://localhost:3001/api"; // 確保是這一行 (用於開發)
  ```

**B. 建立後端 .env 檔案**

- 在 `backend` 資料夾內 (與 `backend/package.json` 同層) 建立一個 `.env` 檔案。
- **注意：** 這個 `.env` 與根目錄的 `.env` 是**分開**的。
- 在 `backend/.env` 中貼上**與根目錄 .env 相同的內容**：
  ```
  JWT_SECRET=my-super-strong-and-random-secret-key-123456789
  ADMIN_USERNAME=
  ADMIN_PASSWORD=
  ```

### 2. 啟動後端 (Backend) 伺服器

- **開啟終端機 A**:

  ```bash
  # 1. 進入後端資料夾
  cd backend

  # 2. 安裝依賴
  npm install

  # 3. (首次執行) 刪除舊資料庫 (如果存在) 並執行所有資料庫遷移
  # (Windows 使用 del, macOS/Linux 使用 rm)
  rm db/dev.sqlite3
  npx knex migrate:latest --knexfile knexfile.ts

  # 4. 啟動後端開發伺服器
  # (它會自動讀取 backend/.env 並建立 admin)
  npm run dev
  ```

- _(後端將運行在 `http://localhost:3001`)_

### 3. 啟動前端 (Frontend) 伺服器

- **開啟終端機 B**:

  ```bash
  # 1. 進入前端資料夾
  cd frontend

  # 2. 安裝依賴
  npm install

  # 3. 啟動前端開發伺服器
  npm run dev
  ```

- _(前端將運行在 `http://localhost:3000`)_

### 4. 訪問系統

- 打開瀏覽器，前往： `http://localhost:3000`
- 您可以直接使用 `backend/.env` 中設定的帳號密碼登入。
