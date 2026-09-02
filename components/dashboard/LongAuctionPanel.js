import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import Meter from "@/components/ui/Meter";
import Badge from "@/components/ui/Badge";
import SectionHeader from "./SectionHeader";
import { formatPrice } from "@/components/ui/format";

const STATUS_TONE = {
  LIVE: "positive",
  ENDED: "neutral",
  NONE: "neutral",
};

/**
 * Long Auction panel for the selected token. Purely a UI representation
 * of mock auction data (actual vs. expected progress, efficiency) — no
 * connection to Long, no scraping, no adapter (see TASK 16–17).
 */
export default function LongAuctionPanel({ token }) {
  const auction = token.auction;
  const hasAuction = auction.status !== "NONE";

  return (
    <Card>
      <SectionHeader
        title="LONG AUCTION"
        action={
          <Badge tone={STATUS_TONE[auction.status] ?? "neutral"}>
            {auction.status}
          </Badge>
        }
      />
      <Divider />

      {hasAuction ? (
        <div className="flex flex-col gap-3 px-4 py-4">
          <Meter
            label="Actual progress"
            valueLabel={`${auction.actual}%`}
            percent={auction.actual}
            tone={auction.actual >= auction.expected ? "positive" : "warning"}
          />
          <Meter
            label="Expected progress"
            valueLabel={`${auction.expected}%`}
            percent={auction.expected}
            tone="neutral"
          />

          <Divider className="my-1" />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-secondary">
              Efficiency
            </span>
            <span
              className={`tabular text-sm font-semibold ${
                auction.efficiency >= 1 ? "text-positive" : "text-negative"
              }`}
            >
              {auction.efficiency.toFixed(2)}x
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-secondary">
              Auction price
            </span>
            <span className="tabular text-xs font-medium text-text-primary">
              {formatPrice(auction.price)}
            </span>
          </div>
        </div>
      ) : (
        <div className="px-4 py-8 text-center text-xs text-text-muted">
          No Long auction data for this token.
        </div>
      )}
    </Card>
  );
}
