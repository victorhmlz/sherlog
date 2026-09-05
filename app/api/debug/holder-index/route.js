// -----------------------------------------------------------------------
// SHERLOG — holder analysis manual verification route (TASK 14)
//
// Not called by anything else in the app — see lib/chain/holders.js's
// module-level note before reading too much into the result: unless
// `fromBlock` covers the token's full history (at or before its
// deployment block), this describes net accumulation/distribution
// during the given window, not absolute current holder concentration.
//
// Query params:
//   chain      required — one of SUPPORTED_EVM_CHAINS (ETH/BASE/ARB/BSC)
//   token      required — an ERC-20 contract address
//   fromBlock  required — no default on purpose (see the accuracy note
//              above; silently defaulting to "recent" would encourage
//              reading a partial-window result as absolute concentration)
//   toBlock    optional — defaults to `latest`
// -----------------------------------------------------------------------

import { NextResponse } from "next/server";
import { getEvmClient, SUPPORTED_EVM_CHAINS } from "@/lib/chain/clients";
import { indexHolderDistribution } from "@/lib/chain/holders";

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const chain = params.get("chain");
  const token = params.get("token");

  if (!chain || !SUPPORTED_EVM_CHAINS.includes(chain)) {
    return NextResponse.json(
      { ok: false, error: `"chain" must be one of: ${SUPPORTED_EVM_CHAINS.join(", ")}.` },
      { status: 400 },
    );
  }
  if (!token) {
    return NextResponse.json({ ok: false, error: '"token" query param is required.' }, { status: 400 });
  }
  if (!params.has("fromBlock")) {
    return NextResponse.json(
      {
        ok: false,
        error:
          '"fromBlock" is required (no default) — for real holder concentration it should be at or ' +
          'before the token\'s deployment block; a recent fromBlock only measures the accumulation/' +
          "distribution that happened within this window, not current concentration. See " +
          "lib/chain/holders.js's module-level comment.",
      },
      { status: 400 },
    );
  }

  try {
    const client = getEvmClient(chain);
    const fromBlock = BigInt(params.get("fromBlock"));
    const toBlock = params.has("toBlock") ? BigInt(params.get("toBlock")) : await client.getBlockNumber();

    const summary = await indexHolderDistribution(chain, token, { fromBlock, toBlock });

    return NextResponse.json({
      ok: true,
      chain,
      token,
      fromBlock: fromBlock.toString(),
      toBlock: toBlock.toString(),
      ...summary,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
