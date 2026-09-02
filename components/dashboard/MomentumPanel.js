import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import Meter from "@/components/ui/Meter";
import StatusIndicator from "@/components/ui/StatusIndicator";
import SectionHeader from "./SectionHeader";
import { formatMultiplier, formatCount } from "@/components/ui/format";

// Accelerations are unbounded multipliers; 5x is treated as a practical
// ceiling for the bar fill so the meter stays readable.
const ACCELERATION_CEILING = 5;

const LIQUIDITY_TREND_TONE = {
  RISING: "positive",
  STABLE: "neutral",
  FALLING: "negative",
};

/**
 * Momentum panel for the selected token: separates raw price movement
 * from the underlying demand-acceleration variables (volume/buyer
 * acceleration, buy pressure, unique buyers, liquidity trend). Bars are
 * plain CSS via the shared Meter component — no charting library.
 */
export default function MomentumPanel({ token }) {
  return (
    <Card>
      <SectionHeader title="MOMENTUM" />
      <Divider />

      <div className="flex flex-col gap-3 px-4 py-4">
        <Meter
          label="Volume Acceleration"
          valueLabel={formatMultiplier(token.volumeAcceleration)}
          percent={(token.volumeAcceleration / ACCELERATION_CEILING) * 100}
          tone={token.volumeAcceleration >= 1 ? "positive" : "warning"}
        />
        <Meter
          label="Buyer Acceleration"
          valueLabel={formatMultiplier(token.buyerAcceleration)}
          percent={(token.buyerAcceleration / ACCELERATION_CEILING) * 100}
          tone={token.buyerAcceleration >= 1 ? "positive" : "warning"}
        />
        <Meter
          label="Buy Pressure"
          valueLabel={`${token.buyPressure}%`}
          percent={token.buyPressure}
          tone="accent"
        />

        <Divider className="my-1" />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-text-secondary">
            Unique Buyers
          </span>
          <span className="tabular text-xs font-medium text-text-primary">
            {formatCount(token.uniqueBuyers)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-text-secondary">
            Liquidity Trend
          </span>
          <StatusIndicator
            label={token.liquidityTrend}
            tone={LIQUIDITY_TREND_TONE[token.liquidityTrend] ?? "neutral"}
          />
        </div>
      </div>
    </Card>
  );
}
