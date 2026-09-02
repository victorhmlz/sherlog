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

/**
 * Compact operational status strip — a single full-width row of stat
 * items so it reads like a terminal status bar, not a marketing card.
 */
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
      <dl className="flex flex-wrap gap-x-8 gap-y-3 px-4 py-3">
        <Item label="Market activity">
          <StatusIndicator
            label={status.activity}
            tone={ACTIVITY_TONE[status.activity] ?? "neutral"}
          />
        </Item>
        <Item label="Momentum">
          <StatusIndicator label={momentumGlyph} tone={momentumTone} />
        </Item>
        <Item label="Liquidity">
          <StatusIndicator
            label={status.liquidity}
            tone={LIQUIDITY_TONE[status.liquidity] ?? "neutral"}
          />
        </Item>
        <Item label="Signal density">
          <span className="tabular text-xs font-medium text-text-primary">
            {formatPercent(status.signalDensity)}
          </span>
        </Item>
      </dl>
    </Card>
  );
}

function Item({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[10px] font-medium tracking-wide text-text-muted">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
