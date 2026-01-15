import knex from "knex";
import { config } from "./knexfile.js";

const db = knex(config.development);

// Global error handling
db.on("query-error", (err) => {
  console.error("Knex query error:", err);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Closing DB connections...");
  await db.destroy();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

module.exports = db;
