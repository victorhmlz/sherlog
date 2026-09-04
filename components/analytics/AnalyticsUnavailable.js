import Link from "next/link";

/**
 * Shown when analytics can't be computed — either no database
 * connection is configured (`getDb()` throws, see
 * lib/data/db/client.js) or the database is reachable but has zero
 * captured `signals` rows yet (nothing for TASK 10's
 * `/api/cron/capture-snapshots` to have written). Both are normal,
 * expected states, not bugs — distinguished by `reason` so the person
 * reading this knows which one they're in.
 */
export default function AnalyticsUnavailable({ reason }) {
  const isNoData = reason === "no-data";

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          Analytics
        </h1>
        <p className="mt-0.5 text-xs text-text-secondary">
          Historical performance and signal calibration.
        </p>
      </div>

      <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line px-6 text-center">
        {isNoData ? (
          <>
            <p className="text-xs font-medium tracking-wide text-text-muted">
              No captures yet.
            </p>
            <p className="max-w-xs text-[11px] text-text-muted">
              Analytics fills in once{" "}
              <code className="text-text-secondary">
                /api/cron/capture-snapshots
              </code>{" "}
              (TASK 10) has run at least once. On Vercel this happens
              automatically once a day; locally, hit that route yourself.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-medium tracking-wide text-text-muted">
              Database not connected.
            </p>
            <p className="max-w-xs text-[11px] text-text-muted">
              Set <code className="text-text-secondary">DATABASE_URL</code> in
              your <code className="text-text-secondary">.env</code> (see{" "}
              <code className="text-text-secondary">.env.example</code>,
              TASK 09) and restart the dev server.
            </p>
          </>
        )}
        <Link
          href="/dashboard"
          className="mt-1 text-[11px] font-medium text-accent transition-colors duration-150 hover:text-text-primary"
        >
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
