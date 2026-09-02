import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import Badge from "@/components/ui/Badge";
import SignalBadge from "./SignalBadge";
import SectionHeader from "./SectionHeader";
import {
  formatPrice,
  formatCompactUsd,
  formatPercent,
  formatMultiplier,
  formatAge,
  formatCount,
} from "@/components/ui/format";

/** Risk attribute value → semantic tone. Risk is independent of score. */
const RISK_TONES = {
  HEALTHY: "positive",
  LOW: "positive",
  CLEAR: "positive",
  STABLE: "positive",
  MODERATE: "warning",
  THIN: "warning",
  "SLIPPAGE RISK": "warning",
  CRITICAL: "negative",
  HIGH: "negative",
  ILLIQUID: "negative",
};

/**
 * Core identity + quantitative snapshot for the currently selected
 * token, plus a compact risk section. Risk is presented as-is from mock
 * data — no Risk Engine logic exists (see docs/ARCHITECTURE.md §7: a
 * token can score high and still carry high risk).
 */
export default function SelectedTokenPanel({ token }) {
  return (
    <Card>
      <SectionHeader
        title="TOKEN METRICS"
        action={<SignalBadge signal={token.signal} />}
      />
      <Divider />

      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        <div>
          <div className="text-sm font-semibold text-text-primary">
            {token.symbol}{" "}
            <span className="text-xs font-normal text-text-muted">
              {token.name}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-text-secondary">
            <Badge tone="neutral">{token.chain}</Badge>
            <span>Age {formatAge(token.ageMinutes)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="tabular text-sm font-semibold text-text-primary">
            {formatPrice(token.price)}
          </div>
          <div className="text-[11px] text-text-muted">Price</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 sm:grid-cols-4">
        <Stat label="Market Cap" value={formatCompactUsd(token.marketCap)} />
        <Stat label="Liquidity" value={formatCompactUsd(token.liquidity)} />
        <Stat label="Volume 30m" value={formatCompactUsd(token.volume30m)} />
        <Stat label="Holders" value={formatCount(token.holders)} />
        <Stat label="Top 10 %" value={formatPercent(token.top10Concentration)} />
        <Stat label="Buy Pressure" value={formatPercent(token.buyPressure)} />
        <Stat
          label="Vol. Accel"
          value={formatMultiplier(token.volumeAcceleration)}
        />
        <Stat
          label="Buyer Accel"
          value={formatMultiplier(token.buyerAcceleration)}
        />
      </div>

      <Divider />

      <div className="px-4 py-3">
        <div className="mb-2 text-[10px] font-semibold tracking-widest text-text-muted">
          RISK
        </div>
        <div className="flex flex-wrap gap-1.5">
          <RiskBadge label="Liquidity" value={token.risk.liquidityStatus} />
          <RiskBadge label="Concentration" value={token.risk.concentration} />
          <RiskBadge label="Contract" value={token.risk.contractRisk} />
          <RiskBadge label="Exit" value={token.risk.exitStatus} />
          <RiskBadge
            label="Suspicious wallets"
            value={String(token.risk.suspiciousWallets)}
            tone={token.risk.suspiciousWallets > 0 ? "negative" : "positive"}
          />
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-medium tracking-wide text-text-muted">
        {label}
      </div>
      <div className="tabular mt-0.5 text-sm font-semibold text-text-primary">
        {value}
      </div>
    </div>
  );
}

function RiskBadge({ label, value, tone }) {
  const resolvedTone = tone ?? RISK_TONES[value] ?? "neutral";
  return (
    <Badge tone={resolvedTone}>
      {label}: {value}
    </Badge>
  );
}
