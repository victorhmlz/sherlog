import Card from "@/components/ui/Card";

/** One global metric tile (active tokens, active signals, volume, etc.). */
export default function MetricCard({ label, value, hint }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] font-medium tracking-wide text-text-muted">
        {label}
      </div>
      <div className="tabular mt-1.5 text-2xl font-semibold text-text-primary">
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] text-text-secondary">{hint}</div>
      )}
    </Card>
  );
}
