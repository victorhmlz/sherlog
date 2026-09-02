/**
 * Professional "not yet implemented" state for routes whose functionality
 * lands in a later task. Deliberately plain — no illustrations, no
 * marketing copy — so it reads as an in-progress terminal section rather
 * than an empty/broken page.
 */
export default function RoutePlaceholder({ title, description }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line px-4 py-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
      </div>

      <div className="flex min-h-[240px] flex-1 items-center justify-center rounded-lg border border-dashed border-line">
        <p className="text-xs font-medium tracking-wide text-text-muted">
          Coming in a future task
        </p>
      </div>
    </div>
  );
}
