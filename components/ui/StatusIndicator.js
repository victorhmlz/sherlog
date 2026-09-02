const TONE_DOT_CLASSES = {
  neutral: "bg-text-muted",
  positive: "bg-positive",
  negative: "bg-negative",
  warning: "bg-warning",
  accent: "bg-accent",
};

/**
 * Small dot + label used for operational status values (market activity,
 * liquidity state, etc.). The label always carries the meaning — the dot
 * color is a secondary reinforcement, not the sole signal.
 */
export default function StatusIndicator({
  label,
  tone = "neutral",
  className = "",
}) {
  const dotClass = TONE_DOT_CLASSES[tone] ?? TONE_DOT_CLASSES.neutral;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
      <span className="text-xs font-medium text-text-primary">{label}</span>
    </span>
  );
}
