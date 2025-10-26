// backend/knexfile.ts

import type { Knex } from "knex";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./db/dev.sqlite3",
    },
    useNullAsDefault: true,
    migrations: {
      directory: "./db/migrations",
    },
    seeds: {
      directory: "./db/seeds",
    },
  },
};

// 找到原本的這一行：
// export default config;

// 把它改成 CommonJS 的語法：
module.exports = config;
