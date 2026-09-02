"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import SectionHeader from "./SectionHeader";
import ScoreBadge from "./ScoreBadge";
import SignalBadge from "./SignalBadge";
import { formatPrice, formatCompactUsd, formatPercent } from "@/components/ui/format";

const COLUMNS = [
  "TOKEN",
  "PRICE",
  "MC",
  "LIQUIDITY",
  "VOL 5M",
  "BUY %",
  "MOMENTUM",
  "SCORE",
  "SIGNAL",
];

/**
 * Primary dashboard table: ranked fictional token opportunities driven
 * entirely by mock data. Rows are locally selectable (visual state only —
 * no token-detail navigation yet, that lands in a later task).
 */
export default function OpportunitiesTable({ tokens }) {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <Card>
      <SectionHeader title="TOP OPPORTUNITIES" />
      <Divider />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="whitespace-nowrap px-4 py-2 text-[10px] font-semibold tracking-widest text-text-muted"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tokens.map((token) => {
              const isSelected = token.id === selectedId;

              return (
                <tr
                  key={token.id}
                  tabIndex={0}
                  aria-selected={isSelected}
                  onClick={() =>
                    setSelectedId((current) =>
                      current === token.id ? null : token.id,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId((current) =>
                        current === token.id ? null : token.id,
                      );
                    }
                  }}
                  className={`cursor-pointer transition-colors duration-150 focus-visible:outline-none ${
                    isSelected
                      ? "bg-surface-elevated"
                      : "hover:bg-surface-elevated/60"
                  }`}
                >
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <div className="text-xs font-semibold text-text-primary">
                      {token.symbol}
                    </div>
                    <div className="text-[11px] text-text-muted">
                      {token.name}
                    </div>
                  </td>
                  <td className="tabular whitespace-nowrap px-4 py-2.5 text-xs text-text-primary">
                    {formatPrice(token.price)}
                  </td>
                  <td className="tabular whitespace-nowrap px-4 py-2.5 text-xs text-text-secondary">
                    {formatCompactUsd(token.marketCap)}
                  </td>
                  <td className="tabular whitespace-nowrap px-4 py-2.5 text-xs text-text-secondary">
                    {formatCompactUsd(token.liquidity)}
                  </td>
                  <td className="tabular whitespace-nowrap px-4 py-2.5 text-xs text-text-secondary">
                    {formatCompactUsd(token.volume5m)}
                  </td>
                  <td className="tabular whitespace-nowrap px-4 py-2.5 text-xs text-text-primary">
                    {formatPercent(token.buyPressure)}
                  </td>
                  <td className="tabular whitespace-nowrap px-4 py-2.5 text-xs text-text-primary">
                    {formatPercent(token.momentum)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <ScoreBadge score={token.score} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <SignalBadge signal={token.signal} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
