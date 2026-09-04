// -----------------------------------------------------------------------
// MICROCAP ENGINE — analytics queries (TASK 11)
//
// This is the FIRST read path in the entire app that queries the
// TASK 09/10 database — every other page (dashboard, token detail)
// still reads exclusively from `mocks/tokens.js`. The data being
// aggregated here is itself captured from the mock simulation (TASK 10
// runs against `mocks/tokens.js`, not real on-chain data — see
// docs/ARCHITECTURE.md, EVM Adapter is TASK 12), so these numbers
// describe "how the mock signals looked over time," not real market
// performance. The point of this task is the read path and the
// aggregation logic being real, not the underlying data being real yet.
//
// Every query here is read-only (no inserts/updates) and independent
// of the Score/Risk/Signal Engines' own logic — this module only
// reads what TASK 10 already persisted, it never recomputes a score or
// a signal itself.
// -----------------------------------------------------------------------

import { sql, desc, eq, count } from "drizzle-orm";
import { getDb } from "./db/client";
import { tokens, signals } from "./db/schema";

/**
 * Aggregate counts across every captured `signals` row: how many
 * captures exist, how many were flagged `isBuyable`, the average
 * score, how many distinct calendar days have been captured, and a
 * breakdown by `setup` state. One query per figure, kept separate
 * (rather than one giant join) since each aggregates over a different
 * grouping — clearer to read and to verify independently.
 */
async function getOverallStats(db) {
  const [totals] = await db
    .select({
      totalCaptures: count(),
      buyableCaptures: sql`count(*) filter (where ${signals.isBuyable})`.mapWith(Number),
      avgScore: sql`avg(${signals.score})`.mapWith(Number),
      distinctDays: sql`count(distinct date_trunc('day', ${signals.timestamp}))`.mapWith(
        Number,
      ),
    })
    .from(signals);

  return totals;
}

/** Count of captured signal rows per `setup` state, most common first. */
async function getSetupBreakdown(db) {
  return db
    .select({ setup: signals.setup, count: count() })
    .from(signals)
    .groupBy(signals.setup)
    .orderBy(desc(count()));
}

/**
 * The single most recent captured signal for every token that has at
 * least one, newest first. Fetches every `signals`+`tokens` join row
 * ordered by timestamp, then keeps only the first (newest) row seen
 * per token in JavaScript. A `DISTINCT ON` query would do this in one
 * round trip, but at this project's scale (a handful of mock tokens,
 * at most one capture per day on Vercel Hobby's cron limit — see
 * TASK 10) the row count is always tiny; the simpler, easier-to-verify
 * approach was chosen over the marginal efficiency gain.
 */
async function getLatestSignalPerToken(db) {
  const rows = await db
    .select({
      symbol: tokens.symbol,
      name: tokens.name,
      score: signals.score,
      setup: signals.setup,
      isBuyable: signals.isBuyable,
      reason: signals.reason,
      timestamp: signals.timestamp,
    })
    .from(signals)
    .innerJoin(tokens, eq(signals.tokenId, tokens.id))
    .orderBy(desc(signals.timestamp));

  const seen = new Set();
  const latest = [];
  for (const row of rows) {
    if (seen.has(row.symbol)) continue;
    seen.add(row.symbol);
    latest.push(row);
  }
  return latest;
}

/**
 * Everything the `/analytics` page needs, fetched together. Returns
 * `null` fields (never throws) when there's simply no data yet — an
 * empty table is a normal, expected state before the first capture
 * has run, not an error.
 */
export async function getAnalyticsSummary() {
  const db = getDb();

  const [overall, setupBreakdown, latestPerToken] = await Promise.all([
    getOverallStats(db),
    getSetupBreakdown(db),
    getLatestSignalPerToken(db),
  ]);

  return {
    totalCaptures: overall?.totalCaptures ?? 0,
    buyableCaptures: overall?.buyableCaptures ?? 0,
    avgScore: overall?.avgScore ?? null,
    distinctDays: overall?.distinctDays ?? 0,
    setupBreakdown,
    latestPerToken,
  };
}
