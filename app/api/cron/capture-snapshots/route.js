// -----------------------------------------------------------------------
// MICROCAP ENGINE — snapshot capture cron route (TASK 10)
//
// Triggered by Vercel Cron (see vercel.json — Hobby plan caps this at
// once per day; see docs/CHANGELOG.md 0.11.0 for the higher-frequency
// alternatives). Also safe to hit manually — during local development,
// or ad-hoc in production — since the route itself has no idea what
// triggered it; each call is just "run one capture pass".
//
// Auth: Vercel automatically sends `Authorization: Bearer
// ${CRON_SECRET}` on cron-triggered requests once `CRON_SECRET` is set
// as a project env var. If it's set here, this route requires a match.
// If it's NOT set (e.g. local dev, before you've configured it on
// Vercel), the check is skipped — same lazy, dev-friendly posture as
// `getDb()`'s DATABASE_URL check (TASK 09). Set CRON_SECRET before
// relying on this in production; an unauthenticated capture route on
// the public internet just means anyone can trigger (harmless, but
// wasteful) inserts.
// -----------------------------------------------------------------------

import { NextResponse } from "next/server";
import { captureSnapshot } from "@/lib/data/capture";

export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const summary = await captureSnapshot();
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
}
