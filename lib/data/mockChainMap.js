// -----------------------------------------------------------------------
// MICROCAP ENGINE — mock chain → chainId mapping (TASK 10)
//
// `lib/data/db/schema.js`'s `tokens.chainId` (TASK 09) follows
// docs/ARCHITECTURE.md §5's EVM-oriented conceptual model (an integer
// chain ID). Mock tokens (`mocks/tokens.js`) instead carry a display
// string like "SOL"/"ETH" (see CHAINS) — there's no real on-chain
// ingestion yet (EVM Adapter is TASK 12), so this is a temporary,
// clearly-labeled shim translating the mock display string into
// *something* the TASK 09 schema can store, not a real chain registry.
//
// EVM chains map to their real, well-known chain IDs (harmless even as
// a placeholder — these numbers are public constants, not secrets).
// SOL isn't EVM and has no integer chain ID; it maps to the sentinel
// `0` rather than a fabricated number that could be mistaken for real.
// -----------------------------------------------------------------------

export const MOCK_CHAIN_TO_CHAIN_ID = {
  ETH: 1,
  BASE: 8453,
  ARB: 42161,
  BSC: 56,
  SOL: 0, // sentinel: non-EVM, no real integer chain ID exists
};

/** Look up a mock token's `chain` string; falls back to the SOL sentinel for anything unrecognized. */
export function chainToChainId(chain) {
  return MOCK_CHAIN_TO_CHAIN_ID[chain] ?? 0;
}
