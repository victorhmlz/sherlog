// -----------------------------------------------------------------------
// SHERLOG — swap indexing (TASK 13)
//
// Reads real `Swap` events from a Uniswap V2-shaped liquidity pool and
// aggregates them into the buy/sell/volume figures MarketSnapshot
// (docs/ARCHITECTURE.md §5) needs — the first real, non-mock source
// for `volume`, `buyPressure`, and unique-buyer/seller counts.
//
// Scope, deliberately narrow:
// - Uniswap V2's `Swap` event ABI is used because it's a de facto
//   standard: the large majority of V2-style DEX forks across all 4
//   supported chains (PancakeSwap V2, SushiSwap, BaseSwap, Camelot V2,
//   etc.) clone it byte-for-byte. Uniswap V3 uses a different event
//   shape (concentrated liquidity, no simple amount0In/amount1In) —
//   out of scope here, a real V3 indexer is a separate, larger effort.
// - This module operates on an EXPLICIT block range (`fromBlock`/
//   `toBlock`), not a time window ("last 5 minutes"). Average block
//   times vary by chain and change with protocol upgrades — Arbitrum's
//   own docs explicitly warn block production "depends entirely on
//   chain usage," not a fixed cadence — so hardcoding a minutes→blocks
//   conversion here would bake in a guess presented as a fact. Turning
//   a time window into a block range is left as the caller's decision.
// - This module does NOT discover which pool to use for a given token
//   (pool discovery/identification is liquidity analysis — TASK 15).
//   The caller supplies a known pool address.
// - "Volume" is reported in the pool's OTHER token's raw units (its
//   quote asset — e.g. WETH, USDC), not USD. Converting to USD needs a
//   price reference, which this module doesn't have and isn't
//   inventing one for.
// - Buyer/seller identity uses the Swap event's own `to` address. For
//   swaps routed through an aggregator/router contract, this can be
//   the router's address rather than the end user's wallet — a real,
//   known limitation of naive swap-log analysis, not glossed over here.
// -----------------------------------------------------------------------

import { getEvmClient } from "./clients";

/**
 * Uniswap V2 pair ABI — only the `Swap` event and the two view
 * functions this module needs to interpret it.
 */
const V2_PAIR_ABI = [
  {
    type: "event",
    name: "Swap",
    inputs: [
      { indexed: true, name: "sender", type: "address" },
      { indexed: false, name: "amount0In", type: "uint256" },
      { indexed: false, name: "amount1In", type: "uint256" },
      { indexed: false, name: "amount0Out", type: "uint256" },
      { indexed: false, name: "amount1Out", type: "uint256" },
      { indexed: true, name: "to", type: "address" },
    ],
  },
  {
    type: "function",
    name: "token0",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "token1",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
];

const SWAP_EVENT_ABI = V2_PAIR_ABI[0];

/** Read a V2-style pool's two token addresses. */
export async function fetchPoolTokens(chainKey, poolAddress) {
  const client = getEvmClient(chainKey);
  const [token0, token1] = await Promise.all([
    client.readContract({ address: poolAddress, abi: V2_PAIR_ABI, functionName: "token0" }),
    client.readContract({ address: poolAddress, abi: V2_PAIR_ABI, functionName: "token1" }),
  ]);
  return { token0, token1 };
}

/**
 * Fetch raw `Swap` events for a pool over a block range, decoded into
 * plain objects (no BigInt left un-labeled — callers still get real
 * `BigInt`s for the amounts, since `summarizeSwaps` needs exact
 * integer arithmetic, but every field is named and typed here rather
 * than left as viem's generic log shape).
 */
export async function fetchSwapLogs(chainKey, poolAddress, { fromBlock, toBlock }) {
  const client = getEvmClient(chainKey);
  const logs = await client.getLogs({
    address: poolAddress,
    event: SWAP_EVENT_ABI,
    fromBlock,
    toBlock,
  });

  return logs.map((log) => ({
    sender: log.args.sender,
    to: log.args.to,
    amount0In: log.args.amount0In,
    amount1In: log.args.amount1In,
    amount0Out: log.args.amount0Out,
    amount1Out: log.args.amount1Out,
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash,
  }));
}

function isSameAddress(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Aggregate decoded swap logs relative to one specific `targetToken`
 * in the pool (must equal `token0` or `token1` — throws otherwise, a
 * real caller error worth surfacing rather than silently misreading
 * every swap's direction). A swap counts as a BUY of `targetToken`
 * when it flows OUT of the pool; a SELL when it flows IN.
 *
 * Pure function — no network, no chain access — so this is fully
 * testable offline with fabricated log data, unlike everything else
 * in this module.
 */
export function summarizeSwaps(logs, { token0, token1, targetToken }) {
  const targetIsToken0 = isSameAddress(targetToken, token0);
  if (!targetIsToken0 && !isSameAddress(targetToken, token1)) {
    throw new Error(
      `targetToken ${targetToken} is neither token0 (${token0}) nor token1 (${token1}) of this pool.`,
    );
  }

  let buys = 0;
  let sells = 0;
  let buyVolumeRaw = 0n;
  let sellVolumeRaw = 0n;
  const buyers = new Set();
  const sellers = new Set();

  for (const log of logs) {
    const targetOut = targetIsToken0 ? log.amount0Out : log.amount1Out;
    const targetIn = targetIsToken0 ? log.amount0In : log.amount1In;
    const quoteIn = targetIsToken0 ? log.amount1In : log.amount0In;
    const quoteOut = targetIsToken0 ? log.amount1Out : log.amount0Out;

    if (targetOut > 0n) {
      buys += 1;
      buyVolumeRaw += quoteIn;
      buyers.add(log.to.toLowerCase());
    } else if (targetIn > 0n) {
      sells += 1;
      sellVolumeRaw += quoteOut;
      sellers.add(log.to.toLowerCase());
    }
    // A swap with both targetOut and targetIn at 0 shouldn't occur for
    // a well-formed V2 pool event, but neither branch firing is safer
    // than guessing — it's simply not counted as a buy or a sell.
  }

  const totalSwaps = buys + sells;
  const buyPressure = totalSwaps === 0 ? null : Math.round((buys / totalSwaps) * 100);

  return {
    totalSwaps,
    buys,
    sells,
    // Raw integer amounts, as strings — same "BigInt doesn't survive
    // JSON.stringify" reasoning as TASK 12's fetchTokenIdentity.
    // Still denominated in the quote token's smallest unit; converting
    // by decimals or to USD is left to the caller.
    buyVolumeRaw: buyVolumeRaw.toString(),
    sellVolumeRaw: sellVolumeRaw.toString(),
    uniqueBuyers: buyers.size,
    uniqueSellers: sellers.size,
    buyPressure,
  };
}

/**
 * Convenience wrapper: fetch a pool's tokens, fetch its swap logs over
 * a block range, and summarize them relative to `targetToken` — the 3
 * steps most callers want together.
 */
export async function indexPoolSwaps(chainKey, poolAddress, targetToken, { fromBlock, toBlock }) {
  const { token0, token1 } = await fetchPoolTokens(chainKey, poolAddress);
  const logs = await fetchSwapLogs(chainKey, poolAddress, { fromBlock, toBlock });
  return summarizeSwaps(logs, { token0, token1, targetToken });
}
