"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { formatCompactUsd, formatRelativeMinutes } from "@/components/ui/format";

/**
 * Simulated 5-minute volume chart for the token detail page (TASK 05).
 * `data` comes from `mocks/priceHistory.js:generatePriceHistory` (same
 * deterministic mock series as `PriceChart`) — not real historical
 * data (see docs/ARCHITECTURE.md §5, TASK 09/10). Not reconciled
 * against `volume30m` or any other aggregate; illustrative only.
 */
export default function VolumeChart({ data }) {
  const chartData = data.map((point) => ({
    ...point,
    label: formatRelativeMinutes(point.minutesAgo),
  }));

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            tickFormatter={formatCompactUsd}
          />
          <Tooltip
            content={<ChartTooltip valueLabel="Volume" formatValue={formatCompactUsd} />}
          />
          <Bar
            dataKey="volume"
            fill="var(--color-accent)"
            fillOpacity={0.55}
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
