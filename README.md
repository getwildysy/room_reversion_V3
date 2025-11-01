# 專科教室借用系統 (Full-Stack Edition)

這是一個功能完整的全端「專科教室借用系統」，從一個 React 前端介面逐步擴展而來。系統包含獨立的後端 API、資料庫、使用者認證、管理者權限，並最終使用 Docker 容器化部署。

## ✨ 主要功能

- **使用者認證**：使用者可以註冊新帳號並登入系統。
- **註冊審核**：新註冊的使用者預設為 `pending` (待審核)，需由管理員批准後才能登入。
- **教室瀏覽**：以日曆形式查看所有教室的預約狀態。
- **教室預約**：已啟用的使用者可以選取多個時段以預約教室。
- **管理後台**：管理者 (`admin` 角色) 擁有專屬後台，可以：
  - **批准/拒絕** 新註冊的使用者。
  - **管理教室** (新增/讀取/更新/刪除)。
  - **管理使用者** (建立/讀取/更新角色/重設密碼/刪除)。
- **容器化**：整個應用程式（前端 + 後端）已被打包到 Docker 容器中，可使用 Docker Compose 一鍵啟動。

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
  # 首次執行：初始化資料庫
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

## 🔑 如何設定管理員 (Admin)

**本系統現在會自動建立預設管理員！**

你**不再需要**手動進入資料庫修改。

1.  **開啟**專案**根目錄**的 `.env` 檔案 (用於 Docker) 或 `backend/.env` 檔案 (用於開發模式)。
2.  設定 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 的值。
3.  **刪除** `backend/db/dev.sqlite3` 資料庫檔案 (如果你想強制重建)。
4.  **啟動**伺服器 (`docker compose up --build` 或 `npm run dev`)。
5.  伺服器在啟動時會自動檢查，如果該管理員不存在，就會用 `active` (已啟用) 和 `admin` (管理員) 的身分建立此帳號。
