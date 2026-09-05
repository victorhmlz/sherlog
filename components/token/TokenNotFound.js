import Link from "next/link";
import WireframeIcon from "@/components/ui/WireframeIcon";

/**
 * "No such token" state for /token/[id] when the id in the URL doesn't
 * match any entry in mocks/tokens.js. Redesigned as one of Sherlog's
 * "moment" screens (see docs/CHANGELOG.md's redesign entry) — an empty
 * screen with no data table to show is exactly where the app's
 * geometric wireframe mark and a bolder headline belong, rather than
 * the dashed-border placeholder box used before.
 */
export default function TokenNotFound({ id }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <WireframeIcon size={140} />
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Token not found
        </h1>
        <p className="max-w-sm text-sm text-text-secondary">
          No monitored token matches “{id}”. It may have dropped off the
          opportunity list.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="text-xs font-medium text-accent transition-colors duration-150 hover:text-text-primary"
      >
        ← Back to dashboard
      </Link>
    </div>
  );
}
