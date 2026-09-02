import TokenDetailHeader from "@/components/token/TokenDetailHeader";
import TokenNotFound from "@/components/token/TokenNotFound";
import SelectedTokenPanel from "@/components/dashboard/SelectedTokenPanel";
import MomentumPanel from "@/components/dashboard/MomentumPanel";
import LongAuctionPanel from "@/components/dashboard/LongAuctionPanel";
import MicrocapScorePanel from "@/components/dashboard/MicrocapScorePanel";
import SignalHistory from "@/components/dashboard/SignalHistory";
import { mockTokens, mockSignalHistory } from "@/mocks/tokens";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const token = mockTokens.find((entry) => entry.id === id);
  return {
    title: token
      ? `${token.symbol} — Microcap Engine`
      : "Token not found — Microcap Engine",
  };
}

/**
 * /token/[id] — full-page single-token deep dive (TASK 03). Reuses the
 * same panels shown inline on the dashboard (TASK 02) so the two views
 * never present conflicting numbers, but gives a token its own
 * shareable URL and room for a token-scoped signal history. All data is
 * still static mock fixtures from mocks/tokens.js — no live data,
 * charts (TASK 05), scoring engine (TASK 06), or realtime stream
 * (TASK 04) exists yet.
 */
export default async function TokenDetailPage({ params }) {
  const { id } = await params;
  const token = mockTokens.find((entry) => entry.id === id);

  if (!token) {
    return <TokenNotFound id={id} />;
  }

  const tokenHistory = mockSignalHistory.filter(
    (entry) => entry.symbol === token.symbol,
  );

  return (
    <div className="flex flex-col">
      <TokenDetailHeader token={token} />

      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <SelectedTokenPanel token={token} />
          <MomentumPanel token={token} />
          <LongAuctionPanel token={token} />
          <MicrocapScorePanel token={token} />
        </div>

        <SignalHistory
          history={tokenHistory}
          title={`SIGNAL HISTORY — ${token.symbol}`}
          emptyMessage="No signal history recorded for this token yet."
        />
      </div>
    </div>
  );
}
