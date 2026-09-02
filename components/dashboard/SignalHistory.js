import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import SectionHeader from "./SectionHeader";
import SignalBadge from "./SignalBadge";

/** Outcome text → tone, based only on the leading sign of the string. */
function outcomeTone(outcome) {
  if (outcome.startsWith("+")) return "text-positive";
  if (outcome.startsWith("-")) return "text-negative";
  return "text-text-muted";
}

/**
 * Compact historical log of recently fired mock signals. Purely a static
 * presentation of `mocks/tokens.js:mockSignalHistory` — no database, no
 * real backtested performance (see TASK 19–21).
 */
export default function SignalHistory({ history }) {
  return (
    <Card>
      <SectionHeader title="SIGNAL HISTORY" />
      <Divider />
      <ul className="divide-y divide-line">
        {history.map((entry, index) => (
          <li
            key={`${entry.time}-${entry.symbol}-${index}`}
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <div className="flex items-center gap-3">
              <span className="tabular w-12 shrink-0 text-[11px] text-text-muted">
                {entry.time}
              </span>
              <span className="text-xs font-semibold text-text-primary">
                ${entry.symbol}
              </span>
              <span className="tabular text-xs text-text-secondary">
                {entry.score}
              </span>
              <SignalBadge signal={entry.signal} />
            </div>
            <span className={`tabular text-xs font-medium ${outcomeTone(entry.outcome)}`}>
              {entry.outcome}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
