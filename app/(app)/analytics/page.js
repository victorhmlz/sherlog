import MetricCard from "@/components/dashboard/MetricCard";
import SetupBreakdownCard from "@/components/analytics/SetupBreakdownCard";
import LatestSignalsTable from "@/components/analytics/LatestSignalsTable";
import AnalyticsUnavailable from "@/components/analytics/AnalyticsUnavailable";
import { getAnalyticsSummary } from "@/lib/data/analytics";
import { formatCount } from "@/components/ui/format";

export const metadata = { title: "Analytics — Sherlog" };

// This page queries the database on every request (TASK 11) — force
// dynamic rendering so `next build` never tries to run that query at
// build time, when DATABASE_URL may not be configured (matches TASK 09
// / TASK 10's "must build without a live DB" discipline).
export const dynamic = "force-dynamic";

/**
 * /analytics — the first page in the app that reads through the
 * TASK 09/10 database instead of `mocks/tokens.js`. Summarizes what
 * `/api/cron/capture-snapshots` (TASK 10) has captured so far: how
 * many captures total, how many were flagged buyable, the breakdown by
 * signal state, and each token's most recent captured signal. The
 * underlying captures are still of the mock simulation, not real
 * on-chain data (EVM Adapter is TASK 12) — this task is about the read
 * path and aggregation being real, not the data itself yet.
 */
export default async function AnalyticsPage() {
  let summary;
  try {
    summary = await getAnalyticsSummary();
  } catch {
    // getDb() throws when DATABASE_URL isn't set (TASK 09) — a normal,
    // expected local-dev state, not a crash.
    return <AnalyticsUnavailable reason="no-db" />;
  }

  if (summary.totalCaptures === 0) {
    return <AnalyticsUnavailable reason="no-data" />;
  }

  const buyablePct = Math.round(
    (summary.buyableCaptures / summary.totalCaptures) * 100,
  );

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-text-primary">
            Analytics
          </h1>
          <p className="mt-0.5 text-xs text-text-secondary">
            Historical performance and signal calibration — from{" "}
            {formatCount(summary.distinctDays)} day
            {summary.distinctDays === 1 ? "" : "s"} of captured data.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="TOTAL CAPTURES"
            value={formatCount(summary.totalCaptures)}
          />
          <MetricCard
            label="BUYABLE CAPTURES"
            value={formatCount(summary.buyableCaptures)}
            hint={`${buyablePct}% of all captures`}
          />
          <MetricCard
            label="AVG SCORE"
            value={summary.avgScore !== null ? summary.avgScore.toFixed(1) : "—"}
          />
          <MetricCard
            label="DAYS CAPTURED"
            value={formatCount(summary.distinctDays)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SetupBreakdownCard breakdown={summary.setupBreakdown} />
          <LatestSignalsTable rows={summary.latestPerToken} />
        </div>
      </div>
    </div>
  );
}
