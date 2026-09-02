const TONE_FILL_CLASSES = {
  neutral: "bg-text-muted",
  positive: "bg-positive",
  negative: "bg-negative",
  warning: "bg-warning",
  accent: "bg-accent",
};

/**
 * Lightweight horizontal bar meter built from plain CSS — used by the
 * Momentum, Long Auction, and Microcap Score panels to visualize bounded
 * quantities without pulling in a charting library (TASK 05 scope).
 * The numeric value is always rendered as text alongside the bar, never
 * conveyed by width/color alone.
 */
export default function Meter({ label, valueLabel, percent, tone = "accent" }) {
  const clamped = Math.max(0, Math.min(100, percent ?? 0));
  const fillClass = TONE_FILL_CLASSES[tone] ?? TONE_FILL_CLASSES.accent;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-text-secondary">{label}</span>
        <span className="tabular font-medium text-text-primary">
          {valueLabel}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
        <div
          className={`h-full rounded-full ${fillClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
