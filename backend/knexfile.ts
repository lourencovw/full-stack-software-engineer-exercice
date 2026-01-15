import { Knex } from "knex";

const cpuCores = Number(process.env.DB_CPU_CORES) || 2;

// HikariCP formula: (core_count * 2) + effective spindle count (≈0 on SSD)
const recommendedPoolSize = cpuCores * 2;

// bounds
const POOL_MIN = Math.max(1, Math.floor(recommendedPoolSize / 2));
const POOL_MAX = Math.max(2, Math.min(recommendedPoolSize, 30));

export const config: { development: Knex.Config } = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || "taskuser",
      password: process.env.DB_PASSWORD || "123123",
      database: process.env.DB_NAME || "taskdb",
    },
    migrations: {
      directory: "./migrations",
    },
    seeds: {
      directory: "./seeds",
    },
    pool: {
      min: POOL_MIN,
      max: POOL_MAX,
      async afterCreate(conn: any, done: any) {
        try {
          await conn.query(`SET timezone = 'UTC'`);
          done(null, conn);
        } catch (err) {
          done(err, conn);
        }
      },
    },
  },
};
