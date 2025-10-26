// backend/db/migrations/TIMESTAMP_create_users_table.ts

import type { Knex } from "knex";

// up 方法：當執行遷移時，knex 會呼叫此方法
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary(); // 自動增加的整數 ID，設為主鍵
    table.string("username").notNullable().unique(); // 使用者名稱，不允許空值且唯一
    table.string("password_hash").notNullable(); // 密碼雜湊，不允許空值
    table.string("role").notNullable().defaultTo("user"); // 角色，預設為 'user'
    table.timestamps(true, true); // 自動建立 created_at 和 updated_at 欄位
  });
}

// down 方法：當復原 (rollback) 遷移時，knex 會呼叫此方法
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users");
}
