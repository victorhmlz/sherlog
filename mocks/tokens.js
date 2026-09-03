// -----------------------------------------------------------------------
// MICROCAP ENGINE — mock data
//
// All values below are fictional demo fixtures used to drive the UI.
// Nothing here is real market data, a real token, a real Long auction,
// or an investment recommendation. This module will be replaced by
// normalized data from real adapters in a later phase (see
// docs/ARCHITECTURE.md §4–5 for the target NormalizedTokenData /
// AuctionData / Signal shapes) — presentation components should only
// ever read this shape, never hardcode values.
//
// `score` / `scoreBreakdown` are no longer hand-authored fixture values
// (TASK 06): each token below carries only its raw feature fields plus
// a `scoreBreakdown: { fomo, price }` seed (the two components with no
// real feature source yet), and `mockTokens` maps every raw fixture
// through `lib/scoring/scoreEngine.js:computeScore` to produce the
// final `score`/`scoreBreakdown` shown across the UI. Score tier
// constants/helpers are re-exported from that module — it is now their
// canonical home, not this one.
// -----------------------------------------------------------------------

import { computeScore, SCORE_TIERS, getScoreTier, SCORE_COMPONENT_MAX, SCORE_COMPONENT_LABELS } from "@/lib/scoring/scoreEngine";

export { SCORE_TIERS, getScoreTier, SCORE_COMPONENT_MAX, SCORE_COMPONENT_LABELS };

/** Ordered list of discrete signal states a token can carry. */
export const SIGNAL_STATES = [
  "IGNORE",
  "WATCH",
  "WATCH+",
  "SETUP B",
  "SETUP A",
  "EXTREME",
];

/** Fictional chains represented in the mock opportunity set. */
export const CHAINS = ["SOL", "ETH", "BASE", "ARB", "BSC"];

/** Long auction lifecycle states used for the Auction status filter. */
export const AUCTION_STATUSES = ["LIVE", "ENDED", "NONE"];

/** Fictional last-update timestamp for the LIVE header (static mock). */
export const mockLastUpdate = "12:42:31";

/** Top-of-dashboard global metric cards. */
export const mockGlobalMetrics = {
  activeTokens: 247,
  activeSignals: 18,
  highScore: 7,
  marketVolume: 4_820_000,
};

/** Compact operational status strip. */
export const mockMarketStatus = {
  activity: "HIGH",
  momentum: "up",
  liquidity: "STABLE",
  signalDensity: 7.4,
};

/**
 * Fictional microcap token fixtures. Symbols/names are invented and do
 * not correspond to real tokens or contracts.
 *
 * Field groups:
 * - identity: id, symbol, name, chain, ageMinutes
 * - snapshot: price, marketCap, liquidity, volume5m, volume30m, buyPressure
 * - momentum: volumeAcceleration/buyerAcceleration (multipliers vs.
 *   trailing baseline), uniqueBuyers, liquidityTrend
 * - holders: holders, top10Concentration
 * - auction: mock Long auction snapshot (see AUCTION_STATUSES)
 * - risk: independent of score — see docs/ARCHITECTURE.md §7
 * - scoreBreakdown: seed for the two components with no real feature
 *   source yet (`fomo`, `price` — see lib/scoring/scoreEngine.js). The
 *   other six components, and the final `score`, are COMPUTED (not
 *   authored here) by the `.map(computeScore)` below TASK 06 onward.
 * - signal: one of SIGNAL_STATES (distinct from the score tier label —
 *   Signal Engine, TASK 08, does not exist yet either)
 */
const rawMockTokens = [
  {
    id: "nxa",
    symbol: "NXA",
    name: "Nexa Alpha",
    chain: "SOL",
    ageMinutes: 14,
    price: 0.000421,
    marketCap: 84_200,
    liquidity: 42_100,
    volume5m: 18_400,
    volume30m: 82_000,
    buyPressure: 71,
    volumeAcceleration: 3.2,
    buyerAcceleration: 2.6,
    uniqueBuyers: 86,
    liquidityTrend: "RISING",
    holders: 412,
    top10Concentration: 24,
    auction: { status: "LIVE", actual: 61, expected: 42, efficiency: 1.45, price: 0.00034 },
    risk: {
      liquidityStatus: "HEALTHY",
      concentration: "LOW",
      contractRisk: "LOW",
      exitStatus: "CLEAR",
      suspiciousWallets: 0,
    },
    scoreBreakdown: { fomo: 14, price: 5 },
    signal: "SETUP A",
  },
  {
    id: "vlt",
    symbol: "VLT",
    name: "Voltus Protocol",
    chain: "ETH",
    ageMinutes: 182,
    price: 0.001842,
    marketCap: 212_600,
    liquidity: 96_300,
    volume5m: 31_200,
    volume30m: 138_000,
    buyPressure: 64,
    volumeAcceleration: 2.1,
    buyerAcceleration: 1.9,
    uniqueBuyers: 143,
    liquidityTrend: "STABLE",
    holders: 968,
    top10Concentration: 31,
    auction: { status: "LIVE", actual: 54, expected: 48, efficiency: 1.13, price: 0.00151 },
    risk: {
      liquidityStatus: "HEALTHY",
      concentration: "MODERATE",
      contractRisk: "LOW",
      exitStatus: "CLEAR",
      suspiciousWallets: 0,
    },
    scoreBreakdown: { fomo: 13, price: 4 },
    signal: "SETUP A",
  },
  {
    id: "qrn",
    symbol: "QRN",
    name: "Quorion",
    chain: "BASE",
    ageMinutes: 46,
    price: 0.0000897,
    marketCap: 48_900,
    liquidity: 21_700,
    volume5m: 9_800,
    volume30m: 41_000,
    buyPressure: 58,
    volumeAcceleration: 1.3,
    buyerAcceleration: 1.1,
    uniqueBuyers: 51,
    liquidityTrend: "STABLE",
    holders: 205,
    top10Concentration: 42,
    auction: { status: "LIVE", actual: 38, expected: 40, efficiency: 0.95, price: 0.0000821 },
    risk: {
      liquidityStatus: "THIN",
      concentration: "MODERATE",
      contractRisk: "MODERATE",
      exitStatus: "SLIPPAGE RISK",
      suspiciousWallets: 1,
    },
    scoreBreakdown: { fomo: 11, price: 4 },
    signal: "SETUP B",
  },
  {
    id: "drft",
    symbol: "DRFT",
    name: "Driftline",
    chain: "SOL",
    ageMinutes: 9,
    price: 0.00256,
    marketCap: 341_000,
    liquidity: 128_400,
    volume5m: 44_600,
    volume30m: 196_000,
    buyPressure: 69,
    volumeAcceleration: 2.8,
    buyerAcceleration: 2.3,
    uniqueBuyers: 201,
    liquidityTrend: "RISING",
    holders: 1_340,
    top10Concentration: 19,
    auction: { status: "LIVE", actual: 58, expected: 39, efficiency: 1.49, price: 0.00201 },
    risk: {
      liquidityStatus: "HEALTHY",
      concentration: "LOW",
      contractRisk: "LOW",
      exitStatus: "CLEAR",
      suspiciousWallets: 0,
    },
    scoreBreakdown: { fomo: 13, price: 4 },
    signal: "SETUP A",
  },
  {
    id: "mrbl",
    symbol: "MRBL",
    name: "Marbleweave",
    chain: "BSC",
    ageMinutes: 612,
    price: 0.0000123,
    marketCap: 19_400,
    liquidity: 8_100,
    volume5m: 2_300,
    volume30m: 9_800,
    buyPressure: 41,
    volumeAcceleration: 0.6,
    buyerAcceleration: 0.5,
    uniqueBuyers: 12,
    liquidityTrend: "FALLING",
    holders: 88,
    top10Concentration: 68,
    auction: { status: "NONE", actual: null, expected: null, efficiency: null, price: null },
    risk: {
      liquidityStatus: "CRITICAL",
      concentration: "HIGH",
      contractRisk: "HIGH",
      exitStatus: "ILLIQUID",
      suspiciousWallets: 3,
    },
    scoreBreakdown: { fomo: 7, price: 2 },
    signal: "IGNORE",
  },
  {
    id: "cndr",
    symbol: "CNDR",
    name: "Cinderline",
    chain: "ARB",
    ageMinutes: 33,
    price: 0.000734,
    marketCap: 96_700,
    liquidity: 38_900,
    volume5m: 14_100,
    volume30m: 59_000,
    buyPressure: 55,
    volumeAcceleration: 1.6,
    buyerAcceleration: 1.4,
    uniqueBuyers: 68,
    liquidityTrend: "STABLE",
    holders: 356,
    top10Concentration: 37,
    auction: { status: "ENDED", actual: 100, expected: 85, efficiency: 1.18, price: 0.000701 },
    risk: {
      liquidityStatus: "THIN",
      concentration: "MODERATE",
      contractRisk: "MODERATE",
      exitStatus: "SLIPPAGE RISK",
      suspiciousWallets: 0,
    },
    scoreBreakdown: { fomo: 10, price: 3 },
    signal: "WATCH+",
  },
  {
    id: "hlx",
    symbol: "HLX",
    name: "Helixnet",
    chain: "SOL",
    ageMinutes: 5,
    price: 0.0141,
    marketCap: 1_284_000,
    liquidity: 402_000,
    volume5m: 118_900,
    volume30m: 512_000,
    buyPressure: 78,
    volumeAcceleration: 4.1,
    buyerAcceleration: 3.4,
    uniqueBuyers: 389,
    liquidityTrend: "RISING",
    holders: 2_870,
    top10Concentration: 15,
    auction: { status: "LIVE", actual: 77, expected: 45, efficiency: 1.71, price: 0.0119 },
    risk: {
      liquidityStatus: "HEALTHY",
      concentration: "LOW",
      contractRisk: "LOW",
      exitStatus: "CLEAR",
      suspiciousWallets: 0,
    },
    scoreBreakdown: { fomo: 14, price: 5 },
    signal: "EXTREME",
  },
  {
    id: "ptra",
    symbol: "PTRA",
    name: "Petrastone",
    chain: "BASE",
    ageMinutes: 288,
    price: 0.000058,
    marketCap: 31_200,
    liquidity: 12_600,
    volume5m: 4_700,
    volume30m: 19_800,
    buyPressure: 49,
    volumeAcceleration: 0.9,
    buyerAcceleration: 0.8,
    uniqueBuyers: 24,
    liquidityTrend: "FALLING",
    holders: 142,
    top10Concentration: 55,
    auction: { status: "NONE", actual: null, expected: null, efficiency: null, price: null },
    risk: {
      liquidityStatus: "CRITICAL",
      concentration: "HIGH",
      contractRisk: "MODERATE",
      exitStatus: "ILLIQUID",
      suspiciousWallets: 2,
    },
    scoreBreakdown: { fomo: 8, price: 3 },
    signal: "WATCH",
  },
  {
    id: "svrn",
    symbol: "SVRN",
    name: "Sovereign Loop",
    chain: "ETH",
    ageMinutes: 97,
    price: 0.000913,
    marketCap: 158_300,
    liquidity: 61_400,
    volume5m: 22_800,
    volume30m: 97_000,
    buyPressure: 62,
    volumeAcceleration: 1.8,
    buyerAcceleration: 1.5,
    uniqueBuyers: 97,
    liquidityTrend: "STABLE",
    holders: 604,
    top10Concentration: 29,
    auction: { status: "LIVE", actual: 49, expected: 44, efficiency: 1.11, price: 0.000842 },
    risk: {
      liquidityStatus: "HEALTHY",
      concentration: "MODERATE",
      contractRisk: "LOW",
      exitStatus: "CLEAR",
      suspiciousWallets: 0,
    },
    scoreBreakdown: { fomo: 12, price: 4 },
    signal: "SETUP B",
  },
  {
    id: "zphr",
    symbol: "ZPHR",
    name: "Zephyrite",
    chain: "SOL",
    ageMinutes: 21,
    price: 0.00203,
    marketCap: 276_900,
    liquidity: 89_200,
    volume5m: 36_500,
    volume30m: 156_000,
    buyPressure: 67,
    volumeAcceleration: 2.4,
    buyerAcceleration: 2.0,
    uniqueBuyers: 132,
    liquidityTrend: "RISING",
    holders: 811,
    top10Concentration: 26,
    auction: { status: "ENDED", actual: 100, expected: 92, efficiency: 1.09, price: 0.00187 },
    risk: {
      liquidityStatus: "HEALTHY",
      concentration: "LOW",
      contractRisk: "LOW",
      exitStatus: "CLEAR",
      suspiciousWallets: 0,
    },
    scoreBreakdown: { fomo: 12, price: 4 },
    signal: "SETUP A",
  },
];

/**
 * The exported token list every component reads. Each raw fixture above
 * is passed through `computeScore` (TASK 06 — see
 * lib/scoring/scoreEngine.js) to produce its final `score` and full
 * 8-component `scoreBreakdown` — the six computed components come from
 * the fixture's own feature fields; `fomo`/`price` pass through the
 * seed values above unchanged (no adapter/model exists for them yet).
 */
export const mockTokens = rawMockTokens.map((token) => {
  const { score, breakdown } = computeScore(token);
  return { ...token, score, scoreBreakdown: breakdown };
});

/**
 * Compact mock signal history log for the dashboard's Signal History
 * panel. Purely a static historical presentation — no persistence, no
 * real backtest/performance calculation (see TASK 19–21 for future
 * paper-trading/backtesting scope).
 */
export const mockSignalHistory = [
  { time: "09:31", symbol: "HLX", score: 91, signal: "SETUP A", outcome: "+38%" },
  { time: "09:42", symbol: "DRFT", score: 84, signal: "SETUP A", outcome: "+21%" },
  { time: "10:03", symbol: "ZPHR", score: 81, signal: "SETUP B", outcome: "+9%" },
  { time: "10:18", symbol: "NXA", score: 88, signal: "SETUP A", outcome: "+54%" },
  { time: "10:47", symbol: "SVRN", score: 76, signal: "SETUP B", outcome: "-4%" },
  { time: "11:05", symbol: "VLT", score: 82, signal: "SETUP A", outcome: "+17%" },
  { time: "11:29", symbol: "QRN", score: 71, signal: "SETUP B", outcome: "PENDING" },
  { time: "11:58", symbol: "CNDR", score: 63, signal: "WATCH+", outcome: "PENDING" },
];
