import LiveDashboard from "@/components/dashboard/LiveDashboard";
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
 * /dashboard — the operational Microcap Engine dashboard (TASK 02),
 * now backed by a simulated realtime stream (TASK 04). Information
 * architecture: header → global metrics → market status →
 * opportunities (with filters) + selected-token detail (metrics,
 * momentum, Long auction, score) → signal history. This server
 * component still reads `mocks/tokens.js` as the single source of
 * truth and hands the initial snapshot to `LiveDashboard`, the client
 * component that owns the mock live-tick simulation. No real data
 * source, scoring, or WebSocket/SSE connection exists yet.
 */
export default function DashboardPage() {
  return (
    <LiveDashboard
      tokens={mockTokens}
      globalMetrics={mockGlobalMetrics}
      marketStatus={mockMarketStatus}
      signalHistory={mockSignalHistory}
    />
  );
}
