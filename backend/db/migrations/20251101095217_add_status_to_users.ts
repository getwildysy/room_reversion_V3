import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    // 新增 status 欄位，預設為 'pending' (待審核)
    table.string("status").notNullable().defaultTo("pending");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    table.dropColumn("status");
  });
}
