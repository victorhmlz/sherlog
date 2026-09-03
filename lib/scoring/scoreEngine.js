// -----------------------------------------------------------------------
// MICROCAP ENGINE — Score Engine (TASK 06)
//
// Deterministic, explainable scoring per docs/ARCHITECTURE.md §6. Given
// a token's feature values, computes a 0–100 score as the sum of eight
// per-component contributions, each traceable back to its raw input —
// "Score 91/100 because: ..." must always be answerable from this
// module's output, never a black box.
//
// V1 weights (NOT final — see ARCHITECTURE.md §6; real calibration is
// TASK 21). Narrative/Social is folded into "fomo" per the TASK 02
// display decision, so this engine works in the same 8-component shape
// already shown on the dashboard:
//
//   Long Auction   20   Volume     15   Buyers     15   Pressure   10
//   Liquidity      10   Holders    10   Fomo       15   Price       5
//
// Six of the eight components — auction, volume, buyers, pressure,
// liquidity, holders (80/100 of the weight) — are COMPUTED here from
// feature fields that already exist on a token (Long auction snapshot,
// volume/buyer acceleration, buy pressure, liquidity + trend, holder
// concentration). The remaining two — `fomo` (no Long/Fomo/external
// signal adapter yet, TASK 16–18) and `price` (no price-structure model
// yet) — have no real underlying feature data at all, so this engine
// does NOT invent a formula for them: it takes them as given inputs
// (`token.scoreBreakdown.fomo` / `.price`) and passes them through
// unchanged. Score Engine is independent of the Risk Engine (TASK 07,
// docs/ARCHITECTURE.md §7) — nothing here reads or reflects `token.risk`.
// -----------------------------------------------------------------------

/** Max points per component — the canonical weighting for this engine. */
export const SCORE_COMPONENT_MAX = {
  auction: 20,
  volume: 15,
  buyers: 15,
  pressure: 10,
  liquidity: 10,
  holders: 10,
  fomo: 15,
  price: 5,
};

/** Display labels for each score component, in presentation order. */
export const SCORE_COMPONENT_LABELS = {
  auction: "Long Auction",
  volume: "Volume",
  buyers: "Buyers",
  pressure: "Pressure",
  liquidity: "Liquidity",
  holders: "Holders",
  fomo: "Fomo",
  price: "Price",
};

/** Components this engine actually computes from feature data. */
export const COMPUTED_COMPONENTS = [
  "auction",
  "volume",
  "buyers",
  "pressure",
  "liquidity",
  "holders",
];

/** Components with no real feature source yet — passed through as given. */
export const PASSTHROUGH_COMPONENTS = ["fomo", "price"];

/** Score → tier label mapping used by ScoreBadge. Ranges are inclusive. */
export const SCORE_TIERS = [
  { min: 0, max: 49, label: "IGNORE" },
  { min: 50, max: 59, label: "WATCH" },
  { min: 60, max: 69, label: "WATCH+" },
  { min: 70, max: 79, label: "SETUP B" },
  { min: 80, max: 89, label: "SETUP A" },
  { min: 90, max: 100, label: "SETUP A+" },
];

/** Resolve a 0–100 score to its tier definition. */
export function getScoreTier(score) {
  return (
    SCORE_TIERS.find((tier) => score >= tier.min && score <= tier.max) ??
    SCORE_TIERS[0]
  );
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Long Auction (max 20). Blends auction efficiency (actual vs. expected
 * progress ratio, already computed upstream) with raw completion, so a
 * fast-but-incomplete auction and a slow-but-complete one both register.
 * No auction (`status: "NONE"`) scores 0 — there is nothing to reward.
 */
function scoreAuction(auction, max) {
  if (!auction || auction.status === "NONE") return 0;
  const efficiencyPoints = clamp((auction.efficiency ?? 0) / 1.5, 0, 1) * (max * 0.6);
  const completionPoints = clamp((auction.actual ?? 0) / 100, 0, 1) * (max * 0.4);
  return Math.round(clamp(efficiencyPoints + completionPoints, 0, max));
}

/**
 * Volume/Buyer Momentum (max 15 each). Both are "multiplier vs. trailing
 * baseline" fields with the same shape, so they share one curve: 1x
 * (flat, no acceleration) scores 0, 3x+ scores at or near the max.
 */
function scoreMomentum(multiplier, max) {
  const normalized = clamp(((multiplier ?? 0) - 1) / 2, 0, 1);
  return Math.round(normalized * max);
}

/** Buy Pressure (max 10). Direct linear map of the 0–100% figure. */
function scorePressure(buyPressurePct, max) {
  return Math.round(clamp((buyPressurePct ?? 0) / 100, 0, 1) * max);
}

/**
 * Liquidity (max 10). Log-scale so the difference between $10K and $50K
 * matters far more than between $500K and $600K, plus a small trend
 * adjustment so `liquidityTrend` (already tracked per token) counts.
 */
function scoreLiquidity(liquidityUsd, trend, max) {
  const base =
    clamp(Math.log10(Math.max(liquidityUsd ?? 0, 1) / 10_000) / Math.log10(15), 0, 1) *
    (max * 0.85);
  const trendBonus =
    trend === "RISING" ? max * 0.15 : trend === "FALLING" ? -(max * 0.15) : 0;
  return Math.round(clamp(base + trendBonus, 0, max));
}

/**
 * Holder Distribution (max 10). Rewards LOW top-10 concentration: 15% or
 * below scores full, 50%+ scores 0, linear between.
 */
function scoreHolders(top10ConcentrationPct, max) {
  const normalized = clamp((50 - (top10ConcentrationPct ?? 50)) / (50 - 15), 0, 1);
  return Math.round(normalized * max);
}

/**
 * Compute a token's Microcap Score. Reads the feature fields already
 * present on the token object (auction, volumeAcceleration,
 * buyerAcceleration, buyPressure, liquidity, liquidityTrend,
 * top10Concentration) for the six computed components, and reads
 * `token.scoreBreakdown.fomo` / `.price` for the two pass-through
 * components (defaulting to 0 if absent — never invented).
 *
 * Returns `{ score, breakdown, tier }`, where `breakdown` always sums
 * exactly to `score` and every component is retrievable individually —
 * this is what makes the output explainable, not just a number.
 */
export function computeScore(token) {
  const breakdown = {
    auction: scoreAuction(token.auction, SCORE_COMPONENT_MAX.auction),
    volume: scoreMomentum(token.volumeAcceleration, SCORE_COMPONENT_MAX.volume),
    buyers: scoreMomentum(token.buyerAcceleration, SCORE_COMPONENT_MAX.buyers),
    pressure: scorePressure(token.buyPressure, SCORE_COMPONENT_MAX.pressure),
    liquidity: scoreLiquidity(
      token.liquidity,
      token.liquidityTrend,
      SCORE_COMPONENT_MAX.liquidity,
    ),
    holders: scoreHolders(token.top10Concentration, SCORE_COMPONENT_MAX.holders),
    fomo: clamp(token.scoreBreakdown?.fomo ?? 0, 0, SCORE_COMPONENT_MAX.fomo),
    price: clamp(token.scoreBreakdown?.price ?? 0, 0, SCORE_COMPONENT_MAX.price),
  };

  const score = clamp(
    Object.values(breakdown).reduce((sum, value) => sum + value, 0),
    0,
    100,
  );

  return { score, breakdown, tier: getScoreTier(score) };
}
