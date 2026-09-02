/**
 * Purely visual "live" indicator (pulsing dot + label). `active` is now
 * driven by `useMockLiveStream` (TASK 04) on the dashboard — still a
 * client-side simulation, not a real WebSocket/SSE connection (that
 * mechanism remains DECISION REQUIRED, see docs/ARCHITECTURE.md §8).
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
