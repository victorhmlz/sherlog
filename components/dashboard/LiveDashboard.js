"use client";

import { useMockLiveStream } from "@/lib/realtime/useMockLiveStream";
import DashboardHeader from "./DashboardHeader";
import MetricCard from "./MetricCard";
import MarketOverview from "./MarketOverview";
import DashboardWorkspace from "./DashboardWorkspace";
import SignalHistory from "./SignalHistory";
import { formatCompactUsd } from "@/components/ui/format";

/**
 * Client-side owner of the dashboard's realtime simulation (TASK 04).
 * Seeds `useMockLiveStream` from the static `mockTokens` fixture passed
 * down by the server-rendered `/dashboard` page (still the single
 * source of truth — see mocks/tokens.js), then re-renders the header's
 * LIVE indicator/timestamp and the opportunities table/selected-token
 * panels on every simulated tick.
 *
 * Deliberately NOT made live in this task: the four top metric cards
 * (`mockGlobalMetrics`) and the Market Status strip (`mockMarketStatus`)
 * describe a wider market than just these 10 fixture tokens, and Signal
 * History is an already-historical log — none of those have a
 * well-defined live derivation yet, so they stay static fixtures here.
 */
export default function LiveDashboard({
  tokens: initialTokens,
  globalMetrics,
  marketStatus,
  signalHistory,
}) {
  const { tokens, lastUpdate, active } = useMockLiveStream(initialTokens);

  return (
    <div className="flex flex-col">
      <DashboardHeader
        monitoredCount={tokens.length}
        lastUpdate={lastUpdate}
        active={active}
      />

      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="ACTIVE TOKENS" value={globalMetrics.activeTokens} />
          <MetricCard label="ACTIVE SIGNALS" value={globalMetrics.activeSignals} />
          <MetricCard label="HIGH SCORE" value={globalMetrics.highScore} />
          <MetricCard
            label="MARKET VOLUME"
            value={formatCompactUsd(globalMetrics.marketVolume)}
          />
        </div>

        <MarketOverview status={marketStatus} />

        <DashboardWorkspace tokens={tokens} />

        <SignalHistory history={signalHistory} />
      </div>
    </div>
  );
}
