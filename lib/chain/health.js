// -----------------------------------------------------------------------
// SHERLOG — RPC connection health check (TASK 12)
//
// The simplest possible proof that a chain's RPC connection actually
// works: ask it for the latest block number. Doesn't need a known
// contract address, so it's useful for verifying the adapter itself,
// independent of any specific token.
// -----------------------------------------------------------------------

import { getEvmClient } from "./clients";

/** Latest block number for a chain, as a string (`BigInt` → JSON-safe). */
export async function getLatestBlockNumber(chainKey) {
  const client = getEvmClient(chainKey);
  const blockNumber = await client.getBlockNumber();
  return blockNumber.toString();
}
