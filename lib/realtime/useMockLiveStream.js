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
 * `lastUpdate` starts `undefined` on purpose (not `formatClockTime(new
 * Date())`): that initializer would run once during SSR and again
 * during client hydration, at two different wall-clock moments — often
 * different seconds — producing a hydration mismatch on
 * `DashboardHeader`'s "Last update" text. Leaving it `undefined` lets
 * `DashboardHeader`'s default prop (the static `mockLastUpdate`
 * fixture) render identically on the server and on the client's first
 * pass; the real current time is then set inside `useEffect`, which by
 * definition never runs during SSR, so it only ever touches the DOM
 * after hydration has already completed.
 *
 * `active` is always `true` while mounted; it is returned (rather than
 * hardcoded in the consuming component) so a future task can flip it to
 * `false` on a real connection drop without changing every call site.
 */
export function useMockLiveStream(initialTokens) {
  const [tokens, setTokens] = useState(initialTokens);
  const [lastUpdate, setLastUpdate] = useState();

  useEffect(() => {
    // First real timestamp, set only after mount — never during SSR.
    // This must run only on the client, after hydration, precisely to
    // AVOID a server/client mismatch on the timestamp text (see the
    // module doc comment above). The rule's usual concern — state that
    // should have been computed during render instead — doesn't apply
    // here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastUpdate(formatClockTime(new Date()));

    const id = setInterval(() => {
      setTokens((current) => tickTokens(current, { elapsedMs: MOCK_STREAM_INTERVAL_MS }));
      setLastUpdate(formatClockTime(new Date()));
    }, MOCK_STREAM_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  return { tokens, lastUpdate, active: true };
}
