import Link from "next/link";
import Badge from "@/components/ui/Badge";
import ScoreBadge from "@/components/dashboard/ScoreBadge";
import SignalBadge from "@/components/dashboard/SignalBadge";
import { formatPrice, formatAge } from "@/components/ui/format";

/**
 * Full-page header for the token detail route (TASK 03). Identity,
 * chain/age, price, score, and signal for the token passed in.
 * `token.signalReason` (TASK 08 — see lib/signal/signalEngine.js) is
 * shown as a small caption under the badges, giving the signal state a
 * visible explanation instead of just a label. Still no data fetching
 * of its own on this page; TASK 04's live stream only reaches
 * `/dashboard`, not this route.
 */
export default function TokenDetailHeader({ token }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line px-4 py-4">
      <Link
        href="/dashboard"
        className="w-fit text-[11px] font-medium text-text-muted transition-colors duration-150 hover:text-text-primary"
      >
        ← Back to dashboard
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-text-primary">
              {token.symbol}
            </h1>
            <span className="text-xs text-text-secondary">{token.name}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-text-secondary">
            <Badge tone="neutral">{token.chain}</Badge>
            <span>Age {formatAge(token.ageMinutes)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="tabular text-base font-semibold text-text-primary">
                {formatPrice(token.price)}
              </div>
              <div className="text-[11px] text-text-muted">Price</div>
            </div>
            <ScoreBadge score={token.score} />
            <SignalBadge signal={token.signal} />
          </div>
          {token.signalReason && (
            <p className="max-w-xs text-right text-[11px] text-text-muted">
              {token.signalReason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
