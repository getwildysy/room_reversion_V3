// backend/db/migrations/TIMESTAMP_create_reservations_table.ts

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("reservations", (table) => {
    table.increments("id").primary();

    // 外部索引鍵 (Foreign Key) - 關聯到 users(id)
    table.integer("user_id").unsigned().notNullable();
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // 外部索引鍵 (Foreign Key) - 關聯到 classrooms(id)
    table.integer("classroom_id").unsigned().notNullable();
    table
      .foreign("classroom_id")
      .references("id")
      .inTable("classrooms")
      .onDelete("CASCADE");

    table.string("purpose").notNullable();
    table.string("date").notNullable(); // 我們使用字串儲存 YYYY-MM-DD
    table.string("time_slot").notNullable(); // 我們使用字串儲存 "第一節"

    table.timestamps(true, true);

    // 複合唯一鍵：防止同一個使用者在同一個時段預約多筆
    table.unique(["user_id", "date", "time_slot"]);
    // 複合唯一鍵：防止同一間教室在同一個時段被多人預約
    table.unique(["classroom_id", "date", "time_slot"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("reservations");
}
