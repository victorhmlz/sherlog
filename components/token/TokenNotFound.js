import Link from "next/link";

/**
 * Plain "no such token" state for /token/[id] when the id in the URL
 * doesn't match any entry in mocks/tokens.js. Deliberately reuses the
 * same restrained style as RoutePlaceholder rather than Next's default
 * 404 page.
 */
export default function TokenNotFound({ id }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          Token not found
        </h1>
        <p className="mt-0.5 text-xs text-text-secondary">
          No monitored token matches “{id}”.
        </p>
      </div>

      <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line">
        <p className="text-xs font-medium tracking-wide text-text-muted">
          It may have dropped off the opportunity list.
        </p>
        <Link
          href="/dashboard"
          className="text-xs font-medium text-accent transition-colors duration-150 hover:text-text-primary"
        >
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
