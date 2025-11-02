import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("reservations", (table) => {
    // 新增 batch_id 欄位，並允許它為空 (null)
    table.string("batch_id").nullable();
    // (可選) 為 batch_id 建立索引，加快未來 "批次刪除" 的速度
    table.index("batch_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("reservations", (table) => {
    table.dropIndex("batch_id");
    table.dropColumn("batch_id");
  });
}
