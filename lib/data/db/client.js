// -----------------------------------------------------------------------
// MICROCAP ENGINE — database client (TASK 09)
//
// Drizzle client wired to Neon's HTTP driver (`drizzle-orm/neon-http`),
// chosen because this app is meant to run on Vercel serverless
// functions eventually — the HTTP driver works there with no TCP
// connection pooling to manage, unlike a traditional `pg` Pool.
//
// Nothing in the app currently imports this module (TASK 09 only sets
// up the schema/client; wiring real reads/writes is TASK 10). It is
// intentionally lazy: `getDb()` only touches `process.env.DATABASE_URL`
// when actually called, not at import time, so simply having this file
// in the tree never breaks `next build` or any route that doesn't use
// it, whether or not `DATABASE_URL` is set.
// -----------------------------------------------------------------------

import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let cachedDb;

/**
 * Get the singleton Drizzle client, creating it on first call. Throws a
 * clear error — not a generic connection failure — if `DATABASE_URL`
 * isn't set, since that's a setup step (see `.env.example`), not a bug.
 */
export function getDb() {
  if (cachedDb) return cachedDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env, set it to your " +
        "Neon connection string, and restart the dev server.",
    );
  }

  cachedDb = drizzle(connectionString, { schema });
  return cachedDb;
}
