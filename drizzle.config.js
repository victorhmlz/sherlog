// -----------------------------------------------------------------------
// MICROCAP ENGINE — drizzle-kit config (TASK 09)
//
// Used only by the `db:generate` / `db:push` / `db:studio` npm scripts
// (drizzle-kit CLI), never imported by the app itself. `DATABASE_URL`
// is read from `.env` via `dotenv` (see .env.example) — `drizzle-kit
// generate` (diffing the schema against the migrations folder) works
// fully offline and does not need a reachable database; only `db:push`
// and `db:studio` actually connect.
// -----------------------------------------------------------------------

import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/data/db/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
