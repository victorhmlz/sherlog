// -----------------------------------------------------------------------
// MICROCAP ENGINE — Risk Engine (TASK 07)
//
// A SEPARATE evaluation from the Score Engine (docs/ARCHITECTURE.md §7):
// a token can score high and still carry high risk, and high risk means
// NO TRADE regardless of score. This module never reads a token's
// `score`/`scoreBreakdown`, and `lib/scoring/scoreEngine.js` never reads
// `token.risk` — the two stay fully independent, as designed.
//
// Two of the five risk attributes are computed here from real feature
// fields already on a token:
//   - `liquidityStatus`  from `liquidity` (USD) + `liquidityTrend`
//   - `concentration`    from `top10Concentration` (%)
// `exitStatus` is a display-level label derived directly from
// `liquidityStatus` (V1: liquidity depth is the primary exit-feasibility
// driver at this phase) — it is NOT fed back into the aggregate below,
// to avoid double-counting the same liquidity signal twice.
//
// The remaining two — `contractRisk` (bytecode/honeypot/mint-authority
// analysis) and `suspiciousWallets` (wallet-clustering/bot detection) —
// have no real feature source at all; no on-chain analysis or adapter
// exists yet. This engine passes them through as given
// (`token.risk.contractRisk` / `.suspiciousWallets`) rather than
// inventing a formula for data that doesn't exist.
// -----------------------------------------------------------------------

const LIQUIDITY_CRITICAL_MAX = 15_000;
const LIQUIDITY_THIN_MAX = 50_000;

const CONCENTRATION_LOW_MAX = 25;
const CONCENTRATION_MODERATE_MAX = 45;

/** Points per qualitative level, shared by the liquidity/concentration/contract scales. */
const LEVEL_POINTS = { LOW: 0, MODERATE: 1, HIGH: 2, HEALTHY: 0, THIN: 1, CRITICAL: 2 };

/** Liquidity (USD) + trend → HEALTHY / THIN / CRITICAL. */
function computeLiquidityStatus(liquidity, trend) {
  if (liquidity < LIQUIDITY_CRITICAL_MAX) return "CRITICAL";
  if (liquidity < LIQUIDITY_THIN_MAX) return "THIN";
  // A falling trend downgrades an otherwise-healthy liquidity pool by
  // one level — the absolute number alone doesn't capture the
  // trajectory.
  return trend === "FALLING" ? "THIN" : "HEALTHY";
}

/** Top-10 holder concentration (%) → LOW / MODERATE / HIGH. */
function computeConcentration(top10ConcentrationPct) {
  if (top10ConcentrationPct <= CONCENTRATION_LOW_MAX) return "LOW";
  if (top10ConcentrationPct <= CONCENTRATION_MODERATE_MAX) return "MODERATE";
  return "HIGH";
}

/** Exit feasibility label, derived directly from `liquidityStatus`. */
function computeExitStatus(liquidityStatus) {
  if (liquidityStatus === "CRITICAL") return "ILLIQUID";
  if (liquidityStatus === "THIN") return "SLIPPAGE RISK";
  return "CLEAR";
}

function suspiciousWalletsPoints(count) {
  if (count >= 3) return 2;
  if (count >= 1) return 1;
  return 0;
}

/** Aggregate points (0–8) → LOW / MODERATE / HIGH overall risk tier. */
function overallFromPoints(points) {
  if (points <= 2) return "LOW";
  if (points <= 5) return "MODERATE";
  return "HIGH";
}

/**
 * Compute a token's risk profile. Returns the same 5-field shape the UI
 * already renders (`liquidityStatus`, `concentration`, `contractRisk`,
 * `exitStatus`, `suspiciousWallets`) plus a new `overall` tier and
 * `noTrade` flag (`overall === "HIGH"`) — the concrete implementation
 * of docs/ARCHITECTURE.md §7's "Score 90 + Risk HIGH = NO TRADE" rule.
 */
export function computeRisk(token) {
  const liquidityStatus = computeLiquidityStatus(token.liquidity, token.liquidityTrend);
  const concentration = computeConcentration(token.top10Concentration);
  const exitStatus = computeExitStatus(liquidityStatus);
  const contractRisk = token.risk?.contractRisk ?? "MODERATE";
  const suspiciousWallets = token.risk?.suspiciousWallets ?? 0;

  const points =
    LEVEL_POINTS[liquidityStatus] +
    LEVEL_POINTS[concentration] +
    LEVEL_POINTS[contractRisk] +
    suspiciousWalletsPoints(suspiciousWallets);

  const overall = overallFromPoints(points);

  return {
    liquidityStatus,
    concentration,
    contractRisk,
    exitStatus,
    suspiciousWallets,
    overall,
    noTrade: overall === "HIGH",
  };
}
