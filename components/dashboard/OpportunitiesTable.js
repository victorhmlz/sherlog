import Link from "next/link";
import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import SectionHeader from "./SectionHeader";
import ScoreBadge from "./ScoreBadge";
import SignalBadge from "./SignalBadge";
import {
  formatPrice,
  formatCompactUsd,
  formatPercent,
  formatAge,
  formatMultiplier,
} from "@/components/ui/format";

const COLUMNS = [
  "TOKEN",
  "CHAIN",
  "AGE",
  "PRICE",
  "MC",
  "LIQUIDITY",
  "VOL 5M",
  "BUY %",
  "VOL ACCEL",
  "SCORE",
  "SIGNAL",
];

/**
 * Primary dashboard table: ranked fictional token opportunities. Purely
 * presentational — sorting/filtering happens in the parent
 * (DashboardWorkspace); this component only renders whatever `tokens`
 * it is given, in order. Row selection state is lifted to the parent so
 * the selected-token panels below can react to it.
 */
export default function OpportunitiesTable({ tokens, selectedId, onSelectToken }) {
  return (
    <Card>
      <SectionHeader title="TOP OPPORTUNITIES" action={<CountHint count={tokens.length} />} />
      <Divider />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left">
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
            {tokens.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-8 text-center text-xs text-text-muted"
                >
                  No opportunities match the current filters.
                </td>
              </tr>
            ) : (
              tokens.map((token) => {
                const isSelected = token.id === selectedId;

                return (
                  <tr
                    key={token.id}
                    tabIndex={0}
                    aria-selected={isSelected}
                    onClick={() => onSelectToken(token.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectToken(token.id);
                      }
                    }}
                    className={`cursor-pointer transition-colors duration-150 focus-visible:outline-none ${
                      isSelected
                        ? "bg-surface-elevated"
                        : "hover:bg-surface-elevated/60"
                    }`}
                  >
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                          />
                        )}
                        <div>
                          <Link
                            href={`/token/${token.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="text-xs font-semibold text-text-primary underline decoration-transparent underline-offset-2 transition-colors duration-150 hover:decoration-text-muted"
                          >
                            {token.symbol}
                          </Link>
                          <div className="text-[11px] text-text-muted">
                            {token.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-[11px] font-medium text-text-secondary">
                      {token.chain}
                    </td>
                    <td className="tabular whitespace-nowrap px-4 py-2.5 text-xs text-text-secondary">
                      {formatAge(token.ageMinutes)}
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
                      {formatMultiplier(token.volumeAcceleration)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <ScoreBadge score={token.score} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <SignalBadge signal={token.signal} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CountHint({ count }) {
  return (
    <span className="text-[11px] text-text-muted">
      {count} shown · sorted by score
    </span>
  );
}
