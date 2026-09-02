/**
 * Purely visual "live" indicator (pulsing dot + label). This is a static
 * mock state for TASK 01 — no realtime connection exists yet. A future
 * task will drive `active` from an actual data stream.
 */
export default function LiveIndicator({ active = true, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium tracking-wide ${
        active ? "text-positive" : "text-text-muted"
      } ${className}`}
      role="status"
    >
      <span className="relative flex h-1.5 w-1.5">
        {active && (
          <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-positive" />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
            active ? "bg-positive" : "bg-text-muted"
          }`}
        />
      </span>
      {active ? "LIVE" : "OFFLINE"}
    </span>
  );
}
