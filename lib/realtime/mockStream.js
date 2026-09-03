// -----------------------------------------------------------------------
// MICROCAP ENGINE — mock realtime stream (TASK 04)
//
// Pure, framework-free simulation of a live market feed. There is no
// WebSocket/SSE connection and no backend (mechanism still DECISION
// REQUIRED per docs/ARCHITECTURE.md §8) — this module only produces the
// *next* fictional tick of an already-mock token, so the UI can feel
// live without inventing a real data source. Consumed by
// `useMockLiveStream` (the only place this should be imported from
// components).
// -----------------------------------------------------------------------

import { computeScore } from "@/lib/scoring/scoreEngine";

/** Milliseconds between simulated ticks. */
export const MOCK_STREAM_INTERVAL_MS = 4000;

/** Random float in [min, max). */
function jitter(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

/**
 * Advance a single mock token by one simulated tick.
 *
 * Fields that plausibly change second-to-second on a live feed are
 * touched: price, market cap (kept proportional to price, since no
 * supply field exists to derive it independently), liquidity (and the
 * `liquidityTrend` label derived from its delta), short-window volume,
 * buy pressure, momentum multipliers, unique buyers, and elapsed age.
 * `score`/`scoreBreakdown` are then recomputed from those updated
 * values via `computeScore` (TASK 06's Score Engine), so the dashboard's
 * score/tier/sort-order genuinely track the live feed instead of
 * freezing while everything around them moves.
 *
 * Deliberately NOT touched here: `risk` (independent Risk Engine —
 * TASK 07), `holders` / `top10Concentration` (holder analysis —
 * TASK 14), and `auction` (Long adapter — TASK 16/17). Ticking those
 * would fake future engines' output, not simulate a market feed — the
 * Score Engine still reads their existing (static) mock values as
 * inputs for the `holders` and `auction` score components.
 */
export function tickToken(token, { elapsedMs = MOCK_STREAM_INTERVAL_MS } = {}) {
  const priceMultiplier = 1 + jitter(-0.015, 0.015);
  const nextPrice = Math.max(token.price * priceMultiplier, 0);
  const nextLiquidity = Math.max(token.liquidity * (1 + jitter(-0.02, 0.02)), 0);
  const liquidityDelta = nextLiquidity - token.liquidity;
  const liquidityDeltaPct = token.liquidity === 0 ? 0 : liquidityDelta / token.liquidity;

  let liquidityTrend = "STABLE";
  if (liquidityDeltaPct > 0.003) liquidityTrend = "RISING";
  else if (liquidityDeltaPct < -0.003) liquidityTrend = "FALLING";

  const nextToken = {
    ...token,
    ageMinutes: token.ageMinutes + elapsedMs / 60_000,
    price: nextPrice,
    marketCap: Math.max(token.marketCap * priceMultiplier, 0),
    liquidity: nextLiquidity,
    liquidityTrend,
    volume5m: Math.max(token.volume5m * (1 + jitter(-0.1, 0.14)), 0),
    volume30m: Math.max(token.volume30m * (1 + jitter(-0.05, 0.07)), 0),
    buyPressure: clamp(Math.round(token.buyPressure + jitter(-4, 4)), 0, 100),
    volumeAcceleration: clamp(
      round1(token.volumeAcceleration + jitter(-0.15, 0.15)),
      0.1,
      9.9,
    ),
    buyerAcceleration: clamp(
      round1(token.buyerAcceleration + jitter(-0.15, 0.15)),
      0.1,
      9.9,
    ),
    uniqueBuyers: clamp(
      Math.round(token.uniqueBuyers + jitter(-3, 5)),
      0,
      Number.MAX_SAFE_INTEGER,
    ),
  };

  const { score, breakdown } = computeScore(nextToken);
  return { ...nextToken, score, scoreBreakdown: breakdown };
}

/** Advance every token in a list by one simulated tick. */
export function tickTokens(tokens, options) {
  return tokens.map((token) => tickToken(token, options));
}
