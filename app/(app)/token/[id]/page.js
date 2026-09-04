import TokenDetailHeader from "@/components/token/TokenDetailHeader";
import TokenNotFound from "@/components/token/TokenNotFound";
import SelectedTokenPanel from "@/components/dashboard/SelectedTokenPanel";
import MomentumPanel from "@/components/dashboard/MomentumPanel";
import LongAuctionPanel from "@/components/dashboard/LongAuctionPanel";
import MicrocapScorePanel from "@/components/dashboard/MicrocapScorePanel";
import SignalHistory from "@/components/dashboard/SignalHistory";
import SectionHeader from "@/components/dashboard/SectionHeader";
import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import PriceChart from "@/components/charts/PriceChart";
import VolumeChart from "@/components/charts/VolumeChart";
import { mockTokens, mockSignalHistory } from "@/mocks/tokens";
import { generatePriceHistory } from "@/mocks/priceHistory";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const token = mockTokens.find((entry) => entry.id === id);
  return {
    title: token
      ? `${token.symbol} — Sherlog`
      : "Token not found — Sherlog",
  };
}

/**
 * /token/[id] — full-page single-token deep dive (TASK 03), now with
 * simulated price/volume charts (TASK 05). Reuses the same panels shown
 * inline on the dashboard (TASK 02) so the two views never present
 * conflicting numbers, but gives a token its own shareable URL and room
 * for a token-scoped signal history plus intraday charts. All data is
 * still static/simulated mock fixtures from mocks/tokens.js and
 * mocks/priceHistory.js — no real historical persistence (TASK 09/10),
 * scoring engine (TASK 06), or realtime stream on this page (TASK 04
 * only wired up the dashboard) exists yet.
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
  const priceHistory = generatePriceHistory(token);

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

        <div className="flex flex-col gap-2">
          <p className="px-1 text-[11px] text-text-muted">
            Simulated intraday history — no persisted snapshots yet (see
            TASK 09/10).
          </p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <SectionHeader title="PRICE" />
              <Divider />
              <div className="px-2 pb-3 pt-2">
                <PriceChart data={priceHistory} />
              </div>
            </Card>
            <Card>
              <SectionHeader title="VOLUME (5M)" />
              <Divider />
              <div className="px-2 pb-3 pt-2">
                <VolumeChart data={priceHistory} />
              </div>
            </Card>
          </div>
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
