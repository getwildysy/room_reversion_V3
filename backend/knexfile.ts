// backend/knexfile.ts

import type { Knex } from "knex";
// 使用 CommonJS 'require' 來匯入 'path'
const path = require("path");

const config: { [key: string]: Knex.Config } = {
  // --- 開發環境 (npm run dev) ---
  development: {
    client: "sqlite3",
    connection: {
      // __dirname 在 'ts-node' 下會是 /app
      filename: path.resolve(__dirname, "db", "dev.sqlite3"),
    },
    useNullAsDefault: true,
    migrations: {
      // 指向 TypeScript 原始碼
      directory: path.resolve(__dirname, "db", "migrations"),
    },
  },

  // --- ★★★ 生產環境 (Docker) ★★★ ---
  production: {
    client: "sqlite3",
    connection: {
      // __dirname 在 'node' 下會是 /app/dist
      // 我們使用 '..' 來回到 /app/db/
      filename: path.resolve(__dirname, "..", "db", "dev.sqlite3"),
    },
    useNullAsDefault: true,
    migrations: {
      // 指向編譯後的 JavaScript 檔案
      directory: path.resolve(__dirname, "db", "migrations"),
    },
  },
};

module.exports = config;
