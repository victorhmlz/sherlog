// -----------------------------------------------------------------------
// SHERLOG — holder analysis (TASK 14)
//
// Reads real `Transfer` events for an ERC-20 token and reconstructs
// holder balances from them, to compute top1/top5/top10 concentration
// — the first real, non-mock source for MarketSnapshot's `holders` and
// `top1Pct`/`top5Pct`/`top10Pct` fields (docs/ARCHITECTURE.md §5).
//
// IMPORTANT — read before using this for anything real:
//
// This module can only tell you the balance CHANGES that happened
// within the block range you give it, not absolute balances, unless
// that range starts at (or before) the token's deployment block. A
// `Transfer` log stream starting from an arbitrary recent block has no
// idea what anyone's balance was BEFORE that block — so:
//   - `fromBlock` = the token's deployment block (or earlier) → the
//     reconstructed balances ARE the real, current, absolute holder
//     distribution. This is the only case where "top10Pct" means what
//     it sounds like it means.
//   - `fromBlock` = some arbitrary recent block → the numbers describe
//     net accumulation/distribution *during that window only* (who has
//     been buying vs. selling recently), which is a genuinely useful
//     but DIFFERENT thing than current concentration. Presenting it as
//     "current holder concentration" would be wrong.
// This module doesn't guess which case applies — it's an explicit
// input, same posture as TASK 13's `swaps.js` (explicit block ranges,
// no hidden time-window assumptions). For an old, high-activity token,
// indexing from deployment may mean millions of transfer events over
// a huge block range — a single `getLogs` call (what this module does,
// no pagination) will hit most public RPC providers' range/response
// limits long before reaching "latest" for such a token. That's a real
// practical ceiling on this V1, not hidden: it works well for a
// young/quiet token, and needs a dedicated indexing service (out of
// scope here) for an old, heavily-traded one.
// -----------------------------------------------------------------------

import { getEvmClient } from "./clients";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/** Standard ERC-20 `Transfer` event — identical across every compliant token. */
const TRANSFER_EVENT_ABI = {
  type: "event",
  name: "Transfer",
  inputs: [
    { indexed: true, name: "from", type: "address" },
    { indexed: true, name: "to", type: "address" },
    { indexed: false, name: "value", type: "uint256" },
  ],
};

/** Fetch raw `Transfer` events for a token over a block range, decoded into plain objects. */
export async function fetchTransferLogs(chainKey, tokenAddress, { fromBlock, toBlock }) {
  const client = getEvmClient(chainKey);
  const logs = await client.getLogs({
    address: tokenAddress,
    event: TRANSFER_EVENT_ABI,
    fromBlock,
    toBlock,
  });

  return logs.map((log) => ({
    from: log.args.from,
    to: log.args.to,
    value: log.args.value,
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash,
  }));
}

/**
 * Reconstruct per-address balance CHANGES from a list of transfer
 * logs — see the module-level note above for what this means
 * depending on where `fromBlock` started. Mints (`from` is the zero
 * address) only credit `to`; burns (`to` is the zero address) only
 * debit `from`; ordinary transfers do both. Pure function — no
 * network — so it's fully testable offline with fabricated logs.
 */
export function computeBalanceDeltas(logs) {
  const balances = new Map();

  const adjust = (address, delta) => {
    const current = balances.get(address) ?? 0n;
    balances.set(address, current + delta);
  };

  for (const log of logs) {
    if (log.from !== ZERO_ADDRESS) adjust(log.from, -log.value);
    if (log.to !== ZERO_ADDRESS) adjust(log.to, log.value);
  }

  return balances;
}

/**
 * Rank a Map<address, balance> and compute what share of the total the
 * top 1/5/10 holders control. Zero and negative balances are excluded
 * from both the holder count and the ranking (a negative balance here
 * would mean the input logs didn't cover a complete history — see the
 * module note; this function doesn't try to guess around that, it just
 * doesn't count something that isn't a real positive holding).
 *
 * Pure function — no network — fully testable offline.
 */
export function computeHolderConcentration(balances) {
  const holders = [...balances.entries()]
    .filter(([, balance]) => balance > 0n)
    .sort((a, b) => (b[1] > a[1] ? 1 : b[1] < a[1] ? -1 : 0));

  const totalSupply = holders.reduce((sum, [, balance]) => sum + balance, 0n);

  const pctOfTop = (n) => {
    if (totalSupply === 0n) return null;
    const topSum = holders.slice(0, n).reduce((sum, [, balance]) => sum + balance, 0n);
    // Scale before dividing so this stays exact integer math, then
    // convert to a plain JS number only at the very end for display.
    return Math.round(Number((topSum * 10000n) / totalSupply)) / 100;
  };

  return {
    holderCount: holders.length,
    totalSupply: totalSupply.toString(),
    top1Pct: pctOfTop(1),
    top5Pct: pctOfTop(5),
    top10Pct: pctOfTop(10),
  };
}

/**
 * Convenience wrapper: fetch a token's transfer logs over a block
 * range and compute holder concentration from them in one call. See
 * the module-level note — this is only "current holder distribution"
 * if `fromBlock` covers the token's full history.
 */
export async function indexHolderDistribution(chainKey, tokenAddress, { fromBlock, toBlock }) {
  const logs = await fetchTransferLogs(chainKey, tokenAddress, { fromBlock, toBlock });
  const balances = computeBalanceDeltas(logs);
  return computeHolderConcentration(balances);
}
