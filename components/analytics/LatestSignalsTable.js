import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import SectionHeader from "@/components/dashboard/SectionHeader";
import SignalBadge from "@/components/dashboard/SignalBadge";
import Badge from "@/components/ui/Badge";
import { formatClockTime } from "@/components/ui/format";

/**
 * Most recent captured signal per token — see
 * lib/data/analytics.js:getLatestSignalPerToken. Only tokens with at
 * least one capture appear here; a token added to `mocks/tokens.js`
 * after the last capture run simply won't show up yet.
 */
export default function LatestSignalsTable({ rows }) {
  return (
    <Card>
      <SectionHeader title="LATEST CAPTURE PER TOKEN" />
      <Divider />
      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li key={row.symbol} className="flex flex-col gap-1 px-4 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-primary">
                  {row.symbol}
                </span>
                <span className="text-[11px] text-text-muted">{row.name}</span>
                {row.isBuyable && <Badge tone="positive">BUYABLE</Badge>}
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular text-xs text-text-secondary">
                  {row.score}/100
                </span>
                <SignalBadge signal={row.setup} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-text-muted">{row.reason}</p>
              <span className="tabular shrink-0 text-[11px] text-text-muted">
                {formatClockTime(new Date(row.timestamp))}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
