// Shared formatting helpers for financial/numeric display. Centralized so
// price/market-cap/volume formatting stays consistent across the
// opportunities table, metric cards, and market status strip.

/**
 * Format a sub-cent-to-low-value token price with enough significant
 * digits to remain meaningful (microcap prices are frequently < $0.01).
 */
export function formatPrice(value) {
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  // Very small prices: show up to 6 significant decimal digits.
  return `$${value.toFixed(6)}`;
}

/** Format a large dollar figure with K/M suffixes (market cap, liquidity, volume). */
export function formatCompactUsd(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

/** Format a 0–100 percentage value with a fixed sign. */
export function formatPercent(value) {
  return `${value.toFixed(0)}%`;
}

/** Format an acceleration multiplier (e.g. volume/buyer acceleration). */
export function formatMultiplier(value) {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(1)}x`;
}

/** Format a token age given in minutes into a compact "Xm/Xh/Xd" label. */
/**
 * Format an age in minutes as "Xm"/"Xh"/"Xd". Always rounds to a whole
 * number, even in the sub-60-minutes branch: `ageMinutes` ticks live
 * (TASK 04's `tickToken` adds `elapsedMs / 60_000` — a non-terminating
 * binary fraction — every 4 seconds), so after enough ticks it drifts
 * to values like `6.399999999999995` purely from floating-point
 * accumulation. Rendering that raw was a real bug (visible on the live
 * dashboard after a few minutes), not a display choice — the two other
 * branches already rounded; this one just hadn't needed to before
 * TASK 04 existed.
 */
export function formatAge(minutes) {
  if (minutes === null || minutes === undefined) return "—";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

/** Format a compact integer count (holders, unique buyers) with separators. */
export function formatCount(value) {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("en-US");
}

/** Format a Date as a 24h "HH:MM:SS" clock string (matches the header's "Last update" style). */
export function formatClockTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Format a "minutes before now" offset for chart x-axis labels ("now", "-12m", "-1.5h"). */
export function formatRelativeMinutes(minutesAgo) {
  if (minutesAgo <= 0.05) return "now";
  if (minutesAgo < 60) return `-${Math.round(minutesAgo)}m`;
  return `-${(minutesAgo / 60).toFixed(1)}h`;
}
