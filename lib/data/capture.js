// -----------------------------------------------------------------------
// MICROCAP ENGINE — historical snapshot capture (TASK 10)
//
// One "capture pass" = advance every mock token by one simulated tick
// (reusing `lib/realtime/mockStream.js:tickToken`, TASK 04's tested
// pure jitter logic — nothing new invented here) and persist the
// result into the TASK 09 schema: upsert `tokens`, insert one
// `market_snapshots` row, one `signals` row, and (only for tokens with
// a live/ended auction) one `auction_data` row per token.
//
// Each capture starts fresh from `mocks/tokens.js`'s static baseline,
// not from the previous capture's values — `tickToken` applies its own
// random jitter each call, so repeated captures still show real
// variation, but it is NOT a continuously-compounding series (the DB
// schema doesn't carry every field `tickToken` needs — e.g.
// `volumeAcceleration`/`buyerAcceleration` aren't columns on
// `market_snapshots` — so "resume from the last DB row" isn't possible
// without inventing data). A continuously drifting history would need
// either an always-on process or a richer persisted shape; out of
// scope for this task. This is documented here, not hidden.
//
// This module still reads only `mocks/tokens.js` — there is no real
// data source (on-chain adapter is TASK 12, Long adapter is TASK 16).
// -----------------------------------------------------------------------

import { getDb } from "./db/client";
import { tokens, marketSnapshots, signals, auctionData } from "./db/schema";
import { mockTokens } from "@/mocks/tokens";
import { tickToken } from "@/lib/realtime/mockStream";
import { chainToChainId } from "./mockChainMap";

/**
 * Split a token's 8-component `scoreBreakdown` (TASK 06) into the
 * `signals` table's 5 named sub-score columns (TASK 09's schema
 * follows docs/ARCHITECTURE.md §5's Signal shape, which predates the
 * specific 8-component breakdown). Grouping:
 *   momentumScore       = volume + buyers + pressure
 *   liquidityScore       = liquidity
 *   holderScore          = holders
 *   auctionScore          = auction
 *   externalSignalScore  = fomo + price
 * These 5 always sum to exactly `token.score` — verified in this
 * module's tests, not just asserted in a comment.
 */
function splitScoreBreakdown(breakdown) {
  return {
    momentumScore: breakdown.volume + breakdown.buyers + breakdown.pressure,
    liquidityScore: breakdown.liquidity,
    holderScore: breakdown.holders,
    auctionScore: breakdown.auction,
    externalSignalScore: breakdown.fomo + breakdown.price,
  };
}

/**
 * TASK 10's definition of "potentially buyable" for the `signals.
 * isBuyable` convenience column: SETUP A or EXTREME only. Deliberately
 * narrow (excludes SETUP B) — matches the Signal Engine's own
 * "err strict, not loose" posture (EXTREME itself requires BOTH volume
 * AND buyer acceleration ≥ 3x, not just a high score). Adjustable here
 * in one place if the bar should move.
 */
const BUYABLE_SETUPS = new Set(["SETUP A", "EXTREME"]);

function isBuyableSetup(setup) {
  return BUYABLE_SETUPS.has(setup);
}

/**
 * Run one capture pass: tick every mock token once, upsert its
 * `tokens` identity row, and insert `market_snapshots` /  `signals` /
 * (conditionally) `auction_data` rows. Returns a small summary object,
 * never the full rows (keeps the cron route's response light).
 */
export async function captureSnapshot() {
  const db = getDb();
  const capturedAt = new Date();

  let snapshotCount = 0;
  let signalCount = 0;
  let auctionCount = 0;

  for (const baseToken of mockTokens) {
    const token = tickToken(baseToken);
    const chainId = chainToChainId(token.chain);

    const [tokenRow] = await db
      .insert(tokens)
      .values({
        address: `mock:${token.id}`,
        chainId,
        symbol: token.symbol,
        name: token.name,
      })
      .onConflictDoUpdate({
        target: [tokens.address, tokens.chainId],
        set: { symbol: token.symbol, name: token.name, updatedAt: capturedAt },
      })
      .returning({ id: tokens.id });

    await db.insert(marketSnapshots).values({
      tokenId: tokenRow.id,
      timestamp: capturedAt,
      price: token.price.toString(),
      marketCap: token.marketCap.toString(),
      liquidity: token.liquidity.toString(),
      volume5m: token.volume5m.toString(),
      volume30m: token.volume30m.toString(),
      uniqueBuyers5m: token.uniqueBuyers,
      buyPressure: token.buyPressure.toString(),
      holders: token.holders,
      top10Pct: token.top10Concentration.toString(),
      // volume15m, buys5m, sells5m, uniqueSellers5m, top1Pct, top5Pct:
      // no corresponding mock field exists — left null rather than
      // invented.
    });
    snapshotCount++;

    const subScores = splitScoreBreakdown(token.scoreBreakdown);
    await db.insert(signals).values({
      tokenId: tokenRow.id,
      timestamp: capturedAt,
      score: token.score,
      setup: token.signal,
      isBuyable: isBuyableSetup(token.signal),
      ...subScores,
      reason: token.signalReason,
    });
    signalCount++;

    if (token.auction.status !== "NONE") {
      await db.insert(auctionData).values({
        tokenId: tokenRow.id,
        timestamp: capturedAt,
        auctionProgress: token.auction.actual.toString(),
        expectedProgress: token.auction.expected.toString(),
        auctionEfficiency: token.auction.efficiency.toString(),
        price: token.auction.price.toString(),
        // tokensSold: no corresponding mock field — left null.
      });
      auctionCount++;
    }
  }

  return {
    capturedAt: capturedAt.toISOString(),
    tokensProcessed: mockTokens.length,
    marketSnapshotsInserted: snapshotCount,
    signalsInserted: signalCount,
    auctionRowsInserted: auctionCount,
  };
}

// Exported for the standalone verification script (no live DB needed).
export { splitScoreBreakdown, isBuyableSetup };
