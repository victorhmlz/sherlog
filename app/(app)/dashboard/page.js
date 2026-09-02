import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import MarketOverview from "@/components/dashboard/MarketOverview";
import OpportunitiesTable from "@/components/dashboard/OpportunitiesTable";
import { formatCompactUsd } from "@/components/ui/format";
import {
  mockGlobalMetrics,
  mockMarketStatus,
  mockTokens,
} from "@/mocks/tokens";

export const metadata = {
  title: "Dashboard — Microcap Engine",
};

/**
 * /dashboard — the only fully functional route in TASK 01. Everything is
 * driven from mocks/tokens.js; no live data, scoring, or realtime
 * connection exists yet.
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader />

      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="ACTIVE TOKENS"
            value={mockGlobalMetrics.activeTokens}
          />
          <MetricCard
            label="ACTIVE SIGNALS"
            value={mockGlobalMetrics.activeSignals}
          />
          <MetricCard label="HIGH SCORE" value={mockGlobalMetrics.highScore} />
          <MetricCard
            label="MARKET VOLUME"
            value={formatCompactUsd(mockGlobalMetrics.marketVolume)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <MarketOverview status={mockMarketStatus} />
          <OpportunitiesTable tokens={mockTokens} />
        </div>
      </div>
    </div>
  );
}
