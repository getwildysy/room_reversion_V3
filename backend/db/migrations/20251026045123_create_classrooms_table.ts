// backend/db/migrations/TIMESTAMP_create_classrooms_table.ts

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("classrooms", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.integer("capacity").notNullable();
    table.string("color").notNullable();
  });
  // 這個表我們不需要時間戳
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("classrooms");
}
