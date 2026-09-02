"use client";

import { useEffect, useState } from "react";
import { MOCK_STREAM_INTERVAL_MS, tickTokens } from "./mockStream";
import { formatClockTime } from "@/components/ui/format";

/**
 * Drives the dashboard's "live" affordances (see `LiveIndicator`'s own
 * doc comment: "A future task will drive `active` from an actual data
 * stream" — this is that task, simulated). Runs a `setInterval` that
 * advances the given tokens by one mock tick every
 * `MOCK_STREAM_INTERVAL_MS`. There is still no WebSocket/SSE connection
 * (mechanism DECISION REQUIRED, see docs/ARCHITECTURE.md §8) — this is
 * a client-only simulation layered on top of the same static
 * `mocks/tokens.js` fixtures used everywhere else.
 *
 * `active` is always `true` while mounted; it is returned (rather than
 * hardcoded in the consuming component) so a future task can flip it to
 * `false` on a real connection drop without changing every call site.
 */
export function useMockLiveStream(initialTokens) {
  const [tokens, setTokens] = useState(initialTokens);
  const [lastUpdate, setLastUpdate] = useState(() => formatClockTime(new Date()));

  useEffect(() => {
    const id = setInterval(() => {
      setTokens((current) => tickTokens(current, { elapsedMs: MOCK_STREAM_INTERVAL_MS }));
      setLastUpdate(formatClockTime(new Date()));
    }, MOCK_STREAM_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  return { tokens, lastUpdate, active: true };
}
