// backend/src/db.ts

import knex from "knex";
import knexConfig = require("../knexfile"); // 1. 匯入 CJS 模組
import type { Knex } from "knex"; // 2. 匯入 Knex 的型別

// 3. 建立一個介面 (Interface) 來描述設定檔的"形狀"
//    這告訴 TypeScript，這個物件可以用 [key: string] 的方式被存取
interface KnexConfig {
  [key: string]: Knex.Config;
}

const environment = process.env.NODE_ENV || "development";

// 4. 將 knexConfig "斷言" (as) 為我們定義的 KnexConfig 型別
//    這樣 TypeScript 就知道用 'environment' (string) 去存取是安全的
const config = (knexConfig as KnexConfig)[environment];

// 5. (建議) 新增一個執行期檢查，確保該環境的設定真的存在
if (!config) {
  throw new Error(
    `[Server] Knex config for environment '${environment}' not found in knexfile.ts`,
  );
}

// 6. 匯出 knex 實例
export default knex(config);
