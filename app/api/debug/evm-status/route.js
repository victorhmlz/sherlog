// -----------------------------------------------------------------------
// SHERLOG — EVM adapter manual verification route (TASK 12)
//
// Not a cron job, not called by anything else in the app — a plain
// debug endpoint so a person can confirm the RPC connections actually
// work, since this could not be verified from the sandbox this was
// built in (network egress there is restricted to package registries;
// no RPC host is reachable from it). Hits `getLatestBlockNumber` for
// every supported chain independently, so one chain being down doesn't
// hide whether the other three are fine.
// -----------------------------------------------------------------------

import { NextResponse } from "next/server";
import { SUPPORTED_EVM_CHAINS } from "@/lib/chain/clients";
import { getLatestBlockNumber } from "@/lib/chain/health";

export async function GET() {
  const results = {};

  await Promise.all(
    SUPPORTED_EVM_CHAINS.map(async (chainKey) => {
      try {
        const blockNumber = await getLatestBlockNumber(chainKey);
        results[chainKey] = { ok: true, blockNumber };
      } catch (error) {
        results[chainKey] = { ok: false, error: error.message };
      }
    }),
  );

  const allOk = Object.values(results).every((r) => r.ok);
  return NextResponse.json({ ok: allOk, chains: results });
}
