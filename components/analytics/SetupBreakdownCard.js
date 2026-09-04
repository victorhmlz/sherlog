import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import SectionHeader from "@/components/dashboard/SectionHeader";
import SignalBadge from "@/components/dashboard/SignalBadge";
import { formatCount } from "@/components/ui/format";

/**
 * How many captured `signals` rows (across all tokens, all capture
 * runs) landed in each `setup` state — see
 * lib/data/analytics.js:getSetupBreakdown. Purely a count of past
 * captures, not a live count of today's tokens.
 */
export default function SetupBreakdownCard({ breakdown }) {
  const total = breakdown.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card>
      <SectionHeader title="SIGNAL BREAKDOWN" />
      <Divider />
      <ul className="divide-y divide-line">
        {breakdown.map((row) => (
          <li
            key={row.setup}
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <SignalBadge signal={row.setup} />
            <div className="flex items-baseline gap-2">
              <span className="tabular text-xs font-semibold text-text-primary">
                {formatCount(row.count)}
              </span>
              <span className="text-[11px] text-text-muted">
                {total > 0 ? `${Math.round((row.count / total) * 100)}%` : "—"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
