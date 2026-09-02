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
