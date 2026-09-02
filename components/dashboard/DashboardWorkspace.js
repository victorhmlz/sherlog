"use client";

import { useMemo, useState } from "react";
import OpportunityFilters, {
  DEFAULT_FILTERS,
} from "./OpportunityFilters";
import OpportunitiesTable from "./OpportunitiesTable";
import SelectedTokenPanel from "./SelectedTokenPanel";
import MomentumPanel from "./MomentumPanel";
import LongAuctionPanel from "./LongAuctionPanel";
import MicrocapScorePanel from "./MicrocapScorePanel";
import SectionHeader from "./SectionHeader";
import { CHAINS, AUCTION_STATUSES } from "@/mocks/tokens";

/**
 * Owns the interactive core of the dashboard: opportunity filters, the
 * opportunities table, and the selected-token detail panels. All state
 * is local React state (no state-management library) and all filtering
 * happens client-side against the mock token list — no network
 * requests, no backend.
 */
export default function DashboardWorkspace({ tokens }) {
  const sortedTokens = useMemo(
    () => [...tokens].sort((a, b) => b.score - a.score),
    [tokens],
  );

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState(() => sortedTokens[0]?.id ?? null);

  const filteredTokens = useMemo(() => {
    return sortedTokens.filter((token) => {
      if (filters.chain !== "ALL" && token.chain !== filters.chain) return false;
      if (filters.signal !== "ALL" && token.signal !== filters.signal) return false;
      if (token.score < filters.minScore) return false;
      if (
        filters.auctionStatus !== "ALL" &&
        token.auction.status !== filters.auctionStatus
      )
        return false;
      return true;
    });
  }, [sortedTokens, filters]);

  const selectedToken =
    tokens.find((token) => token.id === selectedId) ?? sortedTokens[0];

  function updateFilters(patch) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <OpportunityFilters
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          chains={CHAINS}
          auctionStatuses={AUCTION_STATUSES}
        />
        <OpportunitiesTable
          tokens={filteredTokens}
          selectedId={selectedId}
          onSelectToken={setSelectedId}
        />
      </div>

      {selectedToken && (
        <div className="flex flex-col gap-3">
          <SectionHeader
            title={`SELECTED TOKEN — ${selectedToken.symbol}`}
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <SelectedTokenPanel token={selectedToken} />
            <MomentumPanel token={selectedToken} />
            <LongAuctionPanel token={selectedToken} />
            <MicrocapScorePanel token={selectedToken} />
          </div>
        </div>
      )}
    </div>
  );
}
