import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    // 新增 nickname 欄位，預設值為 '使用者'
    table.string("nickname").notNullable().defaultTo("使用者");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    table.dropColumn("nickname");
  });
}
