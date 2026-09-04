// -----------------------------------------------------------------------
// SHERLOG — EVM RPC clients (TASK 12)
//
// One read-only viem `PublicClient` per supported EVM chain. This app
// never signs transactions or connects a wallet (no trading execution
// anywhere in this project, per docs/ROADMAP.md's own notes) — every
// client here is read-only by construction (no account, no wallet
// client), matching that constraint at the code level, not just by
// convention.
//
// RPC endpoint: each chain uses viem's own built-in public RPC URL by
// default — no signup, no API key, nothing to configure. This matches
// this app's actual call volume (at most one capture pass a day, see
// TASK 10's Vercel Hobby cron limit) — a shared public endpoint is
// genuinely sufficient at that frequency; a dedicated provider would be
// solving a problem this app doesn't have yet. If `RPC_URL_<CHAIN>` is
// set, it overrides the default for that one chain (e.g. after signing
// up for a provider like Chainstack, whose free tier covers exactly
// these four chains) — nothing else in the code needs to change either
// way.
//
// Lazy, like `getDb()` (TASK 09): clients are created on first use, not
// at import time, so this file existing in the tree can never break
// `next build`, and no network call happens just from importing it.
// -----------------------------------------------------------------------

import { createPublicClient, http } from "viem";
import { mainnet, base, arbitrum, bsc } from "viem/chains";

const CHAIN_CONFIG = {
  ETH: { chain: mainnet, envVar: "RPC_URL_ETHEREUM" },
  BASE: { chain: base, envVar: "RPC_URL_BASE" },
  ARB: { chain: arbitrum, envVar: "RPC_URL_ARBITRUM" },
  BSC: { chain: bsc, envVar: "RPC_URL_BSC" },
};

/** The chain keys this adapter supports — matches `mocks/tokens.js`'s CHAINS minus SOL (not EVM). */
export const SUPPORTED_EVM_CHAINS = Object.keys(CHAIN_CONFIG);

const cachedClients = {};

/**
 * Get the read-only viem client for a chain key ("ETH"/"BASE"/"ARB"/
 * "BSC" — same keys `mocks/tokens.js`/`lib/data/mockChainMap.js`
 * already use). Throws a clear error for an unrecognized key rather
 * than silently returning `undefined`.
 */
export function getEvmClient(chainKey) {
  if (cachedClients[chainKey]) return cachedClients[chainKey];

  const config = CHAIN_CONFIG[chainKey];
  if (!config) {
    throw new Error(
      `Unsupported EVM chain key: "${chainKey}". Supported: ${SUPPORTED_EVM_CHAINS.join(", ")}.`,
    );
  }

  // http(undefined) is deliberate, not a placeholder: viem falls back
  // to the chain's own default public RPC URL in that case.
  const rpcUrl = process.env[config.envVar];
  const client = createPublicClient({ chain: config.chain, transport: http(rpcUrl) });

  cachedClients[chainKey] = client;
  return client;
}
