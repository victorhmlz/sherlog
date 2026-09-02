const TONE_CLASSES = {
  neutral: "border-line bg-surface-elevated text-text-secondary",
  positive: "border-positive/30 bg-positive-dim text-positive",
  negative: "border-negative/30 bg-negative-dim text-negative",
  warning: "border-warning/30 bg-warning-dim text-warning",
  accent: "border-accent/30 bg-accent-dim text-accent",
};

/**
 * Small pill label for discrete states (signal states, tags, statuses).
 * Never relies on color alone — pair with a readable text label.
 */
export default function Badge({ children, tone = "neutral", className = "" }) {
  const toneClass = TONE_CLASSES[tone] ?? TONE_CLASSES.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[11px] font-medium leading-none tracking-wide ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
