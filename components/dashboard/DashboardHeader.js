import LiveIndicator from "@/components/ui/LiveIndicator";
import { mockLastUpdate } from "@/mocks/tokens";

/** Page-level heading for /dashboard: identity, tagline, live/update status. */
export default function DashboardHeader() {
  return (
    <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          Microcap Engine
        </h1>
        <p className="mt-0.5 text-xs text-text-secondary">
          Market Intelligence Terminal
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
