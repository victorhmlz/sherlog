import LiveIndicator from "@/components/ui/LiveIndicator";
import Badge from "@/components/ui/Badge";
import { mockLastUpdate } from "@/mocks/tokens";

/**
 * Page-level heading for /dashboard: identity, monitoring state, and an
 * explicit mock/live distinction. The LIVE indicator simulates a live
 * feed for presentation purposes only — the MOCK DATA badge makes clear
 * that no real data source is connected yet (see docs/ARCHITECTURE.md).
 */
export default function DashboardHeader({ monitoredCount }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight text-text-primary">
            Microcap Engine
          </h1>
          <Badge tone="neutral">MOCK DATA</Badge>
        </div>
        <p className="mt-0.5 text-xs text-text-secondary">
          Market Intelligence Terminal · Monitoring {monitoredCount}{" "}
          opportunities
        </p>
      </div>

      <div className="flex items-center gap-4">
        <LiveIndicator active />
        <span className="tabular text-[11px] text-text-muted">
          Last update: {mockLastUpdate}
        </span>
      </div>
    </div>
  );
}
