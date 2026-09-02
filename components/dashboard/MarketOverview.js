import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import StatusIndicator from "@/components/ui/StatusIndicator";
import SectionHeader from "./SectionHeader";
import { formatPercent } from "@/components/ui/format";

const ACTIVITY_TONE = {
  LOW: "neutral",
  MODERATE: "accent",
  HIGH: "positive",
};

const LIQUIDITY_TONE = {
  THIN: "negative",
  STABLE: "positive",
  DEEP: "positive",
};

const MOMENTUM_GLYPH = { up: "\u2191", down: "\u2193", flat: "\u2192" };

/** Compact operational status strip — reads like a terminal, not a marketing card. */
export default function MarketOverview({ status }) {
  const momentumGlyph = MOMENTUM_GLYPH[status.momentum] ?? MOMENTUM_GLYPH.flat;
  const momentumTone =
    status.momentum === "up"
      ? "positive"
      : status.momentum === "down"
        ? "negative"
        : "neutral";

  return (
    <Card>
      <SectionHeader title="MARKET STATUS" />
      <Divider />
      <dl className="divide-y divide-line px-4">
        <Row label="Market activity">
          <StatusIndicator
            label={status.activity}
            tone={ACTIVITY_TONE[status.activity] ?? "neutral"}
          />
        </Row>
        <Row label="Momentum">
          <StatusIndicator
            label={momentumGlyph}
            tone={momentumTone}
          />
        </Row>
        <Row label="Liquidity">
          <StatusIndicator
            label={status.liquidity}
            tone={LIQUIDITY_TONE[status.liquidity] ?? "neutral"}
          />
        </Row>
        <Row label="Signal density">
          <span className="tabular text-xs font-medium text-text-primary">
            {formatPercent(status.signalDensity)}
          </span>
        </Row>
      </dl>
    </Card>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-xs text-text-secondary">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
