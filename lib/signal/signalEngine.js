// -----------------------------------------------------------------------
// MICROCAP ENGINE — Signal Engine (TASK 08)
//
// Reconciles the Score Engine (TASK 06) and Risk Engine (TASK 07) into
// a single actionable `signal` state (one of SIGNAL_STATES in
// mocks/tokens.js) plus a short, human-readable `reason` — the final
// decision layer conceptually described as `Signal` in
// docs/ARCHITECTURE.md §5 (`score, setup, ..., reason`).
//
// This engine does NOT recompute score or risk — it only reads their
// already-computed output (`token.score`, `token.risk`). It needs no
// authored seed of its own: every input it uses (score, risk, momentum
// multipliers) already has a real feature source, so — unlike Score
// and Risk — this is the first engine with zero pass-through fields.
//
// Two rules, applied in order:
//   1. Risk gate — if the Risk Engine's `overall` is HIGH (`noTrade`),
//      the signal is forced to IGNORE regardless of score. This is the
//      concrete enforcement, at the signal layer, of
//      docs/ARCHITECTURE.md §7's "Score 90 + Risk HIGH = NO TRADE".
//   2. Otherwise, the signal follows the Score Engine's tier
//      (IGNORE/WATCH/WATCH+/SETUP B/SETUP A) directly, with one
//      escalation: a SETUP A+ score tier only becomes EXTREME when
//      BOTH volume and buyer acceleration are independently
//      exceptional (>= 3x each) — a high score alone isn't "extreme";
//      violent momentum on top of it is. A SETUP A+ token that doesn't
//      clear that bar is reported as SETUP A (SIGNAL_STATES has no
//      "SETUP A+" of its own — that label is a score-tier concept).
// -----------------------------------------------------------------------

import { getScoreTier } from "@/lib/scoring/scoreEngine";

/** Both volume and buyer acceleration must clear this to earn EXTREME. */
const EXTREME_ACCELERATION_MIN = 3;

/**
 * Compute a token's signal state and a short explanation from its
 * already-computed `score` and `risk`.
 */
export function computeSignal(token) {
  if (token.risk?.noTrade) {
    return {
      signal: "IGNORE",
      reason: `Risk ${token.risk.overall} (NO TRADE) overrides Score ${token.score}.`,
    };
  }

  const tier = getScoreTier(token.score);

  if (
    tier.label === "SETUP A+" &&
    token.volumeAcceleration >= EXTREME_ACCELERATION_MIN &&
    token.buyerAcceleration >= EXTREME_ACCELERATION_MIN
  ) {
    return {
      signal: "EXTREME",
      reason: `Score ${token.score} (SETUP A+) with exceptional volume (${token.volumeAcceleration.toFixed(1)}x) and buyer (${token.buyerAcceleration.toFixed(1)}x) acceleration.`,
    };
  }

  const signal = tier.label === "SETUP A+" ? "SETUP A" : tier.label;
  return {
    signal,
    reason: `Score ${token.score} (${tier.label}), risk ${token.risk?.overall ?? "unknown"}.`,
  };
}
