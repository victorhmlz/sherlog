"use client";

/**
 * Shared recharts tooltip renderer matching the app's dark terminal
 * surfaces — recharts' default tooltip is a plain white box, which
 * clashes badly with `--color-bg`/`--color-surface`.
 */
export default function ChartTooltip({ active, payload, label, valueLabel, formatValue }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-line bg-surface-elevated px-2.5 py-1.5 text-[11px]">
      <div className="text-text-muted">{label}</div>
      <div className="tabular font-medium text-text-primary">
        {valueLabel}: {formatValue(payload[0].value)}
      </div>
    </div>
  );
}
