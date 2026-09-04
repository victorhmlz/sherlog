// -----------------------------------------------------------------------
// SHERLOG — ERC-20 identity reads (TASK 12)
//
// The EVM Adapter's actual capability: given a chain + contract
// address, read that token's on-chain identity via the standard ERC-20
// view functions. This fills exactly the `Token` conceptual shape from
// docs/ARCHITECTURE.md §5 (`address, chainId, symbol, name`) — the
// first time any of that model's fields come from a real chain instead
// of a mock fixture or an authored seed.
//
// This is deliberately narrow. It does NOT compute price, liquidity,
// volume, or holder concentration — those all require indexing swaps
// and transfers over time (TASK 13 — SWAP INDEXING, TASK 14 — HOLDER
// ANALYSIS, TASK 15 — LIQUIDITY ANALYSIS), not a single point-in-time
// contract read. A full `NormalizedTokenData` per §4 needs all of
// those; this task only produces the identity slice of it.
// -----------------------------------------------------------------------

import { getEvmClient } from "./clients";

/** Minimal ERC-20 ABI — only the 4 standard view functions this module reads. */
const ERC20_ABI = [
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
];

/**
 * Read a token's on-chain identity: `name`, `symbol`, `decimals`,
 * `totalSupply` (as a string — `totalSupply` is a `BigInt`, and
 * `BigInt` doesn't survive `JSON.stringify` — plus the real
 * `chainId` from the connected client. All 4 contract reads run
 * concurrently (independent calls, no reason to serialize them).
 *
 * Throws if `address` isn't a deployed ERC-20 contract on that chain
 * (e.g. a wrong address, or a contract missing one of these standard
 * functions) — that's a real, meaningful failure to surface, not
 * something to paper over with a fallback value.
 */
export async function fetchTokenIdentity(chainKey, address) {
  const client = getEvmClient(chainKey);

  const [name, symbol, decimals, totalSupply] = await Promise.all([
    client.readContract({ address, abi: ERC20_ABI, functionName: "name" }),
    client.readContract({ address, abi: ERC20_ABI, functionName: "symbol" }),
    client.readContract({ address, abi: ERC20_ABI, functionName: "decimals" }),
    client.readContract({ address, abi: ERC20_ABI, functionName: "totalSupply" }),
  ]);

  return {
    address,
    chainId: client.chain.id,
    name,
    symbol,
    decimals,
    totalSupply: totalSupply.toString(),
  };
}
