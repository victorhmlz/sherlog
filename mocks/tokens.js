// -----------------------------------------------------------------------
// MICROCAP ENGINE — mock data
//
// TASK 01 scope: all values below are fictional demo fixtures used to
// drive the UI foundation. Nothing here is real market data, a real
// token, or an investment recommendation. This module will be replaced
// by normalized data from real adapters in a later phase — presentation
// components should only ever read this shape, never hardcode values.
// -----------------------------------------------------------------------

/** Ordered list of discrete signal states a token can carry. */
export const SIGNAL_STATES = [
  "IGNORE",
  "WATCH",
  "WATCH+",
  "SETUP B",
  "SETUP A",
  "EXTREME",
];

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
 */
export const mockTokens = [
  {
    id: "nxa",
    symbol: "NXA",
    name: "Nexa Alpha",
    price: 0.000421,
    marketCap: 84_200,
    liquidity: 42_100,
    volume5m: 18_400,
    buyPressure: 71,
    momentum: 88,
    score: 91,
    signal: "SETUP A",
  },
  {
    id: "vlt",
    symbol: "VLT",
    name: "Voltus Protocol",
    price: 0.001842,
    marketCap: 212_600,
    liquidity: 96_300,
    volume5m: 31_200,
    buyPressure: 64,
    momentum: 76,
    score: 84,
    signal: "SETUP A",
  },
  {
    id: "qrn",
    symbol: "QRN",
    name: "Quorion",
    price: 0.0000897,
    marketCap: 48_900,
    liquidity: 21_700,
    volume5m: 9_800,
    buyPressure: 58,
    momentum: 62,
    score: 73,
    signal: "SETUP B",
  },
  {
    id: "drft",
    symbol: "DRFT",
    name: "Driftline",
    price: 0.00256,
    marketCap: 341_000,
    liquidity: 128_400,
    volume5m: 44_600,
    buyPressure: 69,
    momentum: 81,
    score: 88,
    signal: "SETUP A",
  },
  {
    id: "mrbl",
    symbol: "MRBL",
    name: "Marbleweave",
    price: 0.0000123,
    marketCap: 19_400,
    liquidity: 8_100,
    volume5m: 2_300,
    buyPressure: 41,
    momentum: 38,
    score: 47,
    signal: "IGNORE",
  },
  {
    id: "cndr",
    symbol: "CNDR",
    name: "Cinderline",
    price: 0.000734,
    marketCap: 96_700,
    liquidity: 38_900,
    volume5m: 14_100,
    buyPressure: 55,
    momentum: 59,
    score: 65,
    signal: "WATCH+",
  },
  {
    id: "hlx",
    symbol: "HLX",
    name: "Helixnet",
    price: 0.0141,
    marketCap: 1_284_000,
    liquidity: 402_000,
    volume5m: 118_900,
    buyPressure: 78,
    momentum: 94,
    score: 96,
    signal: "EXTREME",
  },
  {
    id: "ptra",
    symbol: "PTRA",
    name: "Petrastone",
    price: 0.000058,
    marketCap: 31_200,
    liquidity: 12_600,
    volume5m: 4_700,
    buyPressure: 49,
    momentum: 44,
    score: 54,
    signal: "WATCH",
  },
  {
    id: "svrn",
    symbol: "SVRN",
    name: "Sovereign Loop",
    price: 0.000913,
    marketCap: 158_300,
    liquidity: 61_400,
    volume5m: 22_800,
    buyPressure: 62,
    momentum: 70,
    score: 79,
    signal: "SETUP B",
  },
  {
    id: "zphr",
    symbol: "ZPHR",
    name: "Zephyrite",
    price: 0.00203,
    marketCap: 276_900,
    liquidity: 89_200,
    volume5m: 36_500,
    buyPressure: 67,
    momentum: 73,
    score: 82,
    signal: "SETUP A",
  },
];
