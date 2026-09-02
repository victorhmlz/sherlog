import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { SIGNAL_STATES } from "@/mocks/tokens";

const SELECT_CLASS =
  "rounded-md border border-line bg-surface-elevated px-2 py-1.5 text-xs text-text-primary transition-colors duration-150 hover:border-line-strong focus-visible:outline-none";

const SCORE_OPTIONS = [0, 50, 60, 70, 80, 90];

export const DEFAULT_FILTERS = {
  chain: "ALL",
  signal: "ALL",
  minScore: 0,
  auctionStatus: "ALL",
};

/**
 * Compact client-side filter bar for the opportunities table. Pure
 * controlled inputs — all state lives in the parent (DashboardWorkspace)
 * so filtering + row selection can stay in sync. No backend, no
 * state-management library.
 */
export default function OpportunityFilters({
  filters,
  onChange,
  onReset,
  chains,
  auctionStatuses,
}) {
  return (
    <Card className="flex flex-wrap items-center gap-2.5 px-4 py-3">
      <Field label="Chain">
        <select
          className={SELECT_CLASS}
          value={filters.chain}
          onChange={(event) => onChange({ chain: event.target.value })}
        >
          <option value="ALL">All chains</option>
          {chains.map((chain) => (
            <option key={chain} value={chain}>
              {chain}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Signal">
        <select
          className={SELECT_CLASS}
          value={filters.signal}
          onChange={(event) => onChange({ signal: event.target.value })}
        >
          <option value="ALL">All signals</option>
          {SIGNAL_STATES.map((signal) => (
            <option key={signal} value={signal}>
              {signal}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Score">
        <select
          className={SELECT_CLASS}
          value={filters.minScore}
          onChange={(event) =>
            onChange({ minScore: Number(event.target.value) })
          }
        >
          {SCORE_OPTIONS.map((min) => (
            <option key={min} value={min}>
              {min === 0 ? "All scores" : `${min}+`}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Auction">
        <select
          className={SELECT_CLASS}
          value={filters.auctionStatus}
          onChange={(event) => onChange({ auctionStatus: event.target.value })}
        >
          <option value="ALL">All statuses</option>
          {auctionStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </Field>

      <Button variant="ghost" className="ml-auto" onClick={onReset}>
        Reset filters
      </Button>
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] text-text-muted">
      {label}
      {children}
    </label>
  );
}
