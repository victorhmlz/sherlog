import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import MarketOverview from "@/components/dashboard/MarketOverview";
import DashboardWorkspace from "@/components/dashboard/DashboardWorkspace";
import SignalHistory from "@/components/dashboard/SignalHistory";
import { formatCompactUsd } from "@/components/ui/format";
import {
  mockGlobalMetrics,
  mockMarketStatus,
  mockTokens,
  mockSignalHistory,
} from "@/mocks/tokens";

export const metadata = {
  title: "Dashboard — Microcap Engine",
};

/**
 * /dashboard — the operational Microcap Engine dashboard (TASK 02).
 * Information architecture: header → global metrics → market status →
 * opportunities (with filters) + selected-token detail (metrics,
 * momentum, Long auction, score) → signal history. Everything is driven
 * from mocks/tokens.js; no live data, scoring, or realtime connection
 * exists yet.
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader monitoredCount={mockTokens.length} />

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

        <MarketOverview status={mockMarketStatus} />

        <DashboardWorkspace tokens={mockTokens} />

        <SignalHistory history={mockSignalHistory} />
      </div>
    </div>
  );
}
