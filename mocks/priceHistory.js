// -----------------------------------------------------------------------
// MICROCAP ENGINE — mock price/volume history (TASK 05)
//
// Synthesizes a plausible intraday price/volume series for a token's
// chart, ending EXACTLY at that token's current `price`/`volume5m` from
// `mocks/tokens.js` so the chart never contradicts the rest of the UI.
// This is intentionally deterministic (seeded from the token's id, not
// `Math.random`) so the same token always renders the same "history" —
// there is no persistence layer yet (see docs/ARCHITECTURE.md §5,
// TASK 09/10 — DATABASE / HISTORICAL SNAPSHOTS remain unimplemented).
// This is a mock fixture generator, not business logic, which is why it
// lives alongside `mocks/tokens.js` rather than under `lib/`.
// -----------------------------------------------------------------------

const MIN_POINTS = 6;
const MAX_POINTS = 36;
const DEFAULT_BUCKET_MINUTES = 5;

/** 32-bit FNV-1a string hash, used only to seed the PRNG below. */
function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic PRNG (mulberry32) — not cryptographic, mock use only. */
function mulberry32(seed) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random float in [min, max) drawn from the given PRNG. */
function jitter(rng, min, max) {
  return min + rng() * (max - min);
}

/**
 * Generate an ascending-time-order price/volume series for `token`,
 * spanning its real `ageMinutes` (so a 14-minute-old token never shows
 * three hours of invented history) with between `MIN_POINTS` and
 * `MAX_POINTS` samples. The final point always equals the token's
 * current `price` and `volume5m` exactly.
 *
 * Note: the synthesized volume series is illustrative only — it is not
 * reconciled against `volume30m` or any other aggregate field.
 */
export function generatePriceHistory(
  token,
  { bucketMinutes = DEFAULT_BUCKET_MINUTES } = {},
) {
  const pointCount = Math.min(
    MAX_POINTS,
    Math.max(MIN_POINTS, Math.round(token.ageMinutes / bucketMinutes) + 1),
  );
  const stepMinutes = pointCount > 1 ? token.ageMinutes / (pointCount - 1) : 0;
  const rng = mulberry32(hashSeed(token.id));

  // Walk backward from the current (known) price/volume to synthesize a
  // plausible past. Index 0 here is "now"; higher indices are older.
  const pricesFromNow = [token.price];
  const volumesFromNow = [token.volume5m];
  for (let i = 1; i < pointCount; i++) {
    const priceStep = 1 + jitter(rng, -0.025, 0.025);
    const prevPrice = pricesFromNow[i - 1];
    pricesFromNow.push(Math.max(prevPrice / priceStep, prevPrice * 0.001));

    const volumeStep = 1 + jitter(rng, -0.25, 0.25);
    const prevVolume = volumesFromNow[i - 1];
    volumesFromNow.push(Math.max(prevVolume / volumeStep, 0));
  }

  const points = [];
  for (let i = 0; i < pointCount; i++) {
    const fromNow = pointCount - 1 - i; // 0 = now, larger = further back
    points.push({
      minutesAgo: fromNow * stepMinutes,
      price: pricesFromNow[fromNow],
      volume: volumesFromNow[fromNow],
    });
  }

  return points;
}
