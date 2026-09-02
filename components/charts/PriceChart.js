"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { formatPrice, formatRelativeMinutes } from "@/components/ui/format";

/**
 * Simulated intraday price chart for the token detail page (TASK 05).
 * `data` comes from `mocks/priceHistory.js:generatePriceHistory` — a
 * deterministic mock series, not real historical/persisted data (see
 * docs/ARCHITECTURE.md §5, TASK 09/10). No trading library, no OHLC
 * candles — a plain area chart is enough for this phase.
 */
export default function PriceChart({ data }) {
  const chartData = data.map((point) => ({
    ...point,
    label: formatRelativeMinutes(point.minutesAgo),
  }));

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
            axisLine={{ stroke: "var(--color-line)" }}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={60}
            domain={["auto", "auto"]}
            tickFormatter={formatPrice}
          />
          <Tooltip
            content={<ChartTooltip valueLabel="Price" formatValue={formatPrice} />}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="var(--color-accent)"
            strokeWidth={1.5}
            fill="url(#priceFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
