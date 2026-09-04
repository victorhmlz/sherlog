// -----------------------------------------------------------------------
// SHERLOG — swap indexing manual verification route (TASK 13)
//
// Not called by anything else in the app — a debug endpoint so a
// person can point the indexer at a real, known pool and see it work,
// since this could not be verified from the sandbox this was built in
// (no RPC host is reachable from there — see TASK 12).
//
// Query params:
//   chain        required — one of SUPPORTED_EVM_CHAINS (ETH/BASE/ARB/BSC)
//   pool         required — a V2-style pool (pair) contract address
//   targetToken  required — which of the pool's two tokens to report
//                 buy/sell direction for (must be its token0 or token1)
//   fromBlock    optional — defaults to `latest - 2000`
//   toBlock      optional — defaults to `latest`
//
// Example (you supply a real pool/token you want to check — see
// dexscreener.com for any token's pool address on these chains):
//   /api/debug/swap-index?chain=BASE&pool=0x...&targetToken=0x...
// -----------------------------------------------------------------------

import { NextResponse } from "next/server";
import { getEvmClient, SUPPORTED_EVM_CHAINS } from "@/lib/chain/clients";
import { indexPoolSwaps } from "@/lib/chain/swaps";

const DEFAULT_BLOCK_RANGE = 2000n;

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const chain = params.get("chain");
  const pool = params.get("pool");
  const targetToken = params.get("targetToken");

  if (!chain || !SUPPORTED_EVM_CHAINS.includes(chain)) {
    return NextResponse.json(
      { ok: false, error: `"chain" must be one of: ${SUPPORTED_EVM_CHAINS.join(", ")}.` },
      { status: 400 },
    );
  }
  if (!pool || !targetToken) {
    return NextResponse.json(
      { ok: false, error: '"pool" and "targetToken" query params are both required.' },
      { status: 400 },
    );
  }

  try {
    const client = getEvmClient(chain);
    const latest = await client.getBlockNumber();

    const fromBlock = params.has("fromBlock")
      ? BigInt(params.get("fromBlock"))
      : latest - DEFAULT_BLOCK_RANGE;
    const toBlock = params.has("toBlock") ? BigInt(params.get("toBlock")) : latest;

    const summary = await indexPoolSwaps(chain, pool, targetToken, { fromBlock, toBlock });

    return NextResponse.json({
      ok: true,
      chain,
      pool,
      targetToken,
      fromBlock: fromBlock.toString(),
      toBlock: toBlock.toString(),
      ...summary,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
