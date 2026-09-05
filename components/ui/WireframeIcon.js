/**
 * Sherlog's geometric "empty state" mark — an isometric wireframe cube
 * with a green gradient stroke, reserved for the handful of screens
 * that have no data table to show (token not found, no analytics data
 * yet, etc.). Inspired by Genesis Block's (genesisblockchain.io) hero
 * cube and diamond icon system, recolored from their cyan-to-violet
 * into Sherlog's own brand green (`--color-wireframe-start/-end`).
 *
 * Deliberately reserved for these "moment" screens rather than reused
 * as decoration elsewhere — the whole dashboard doesn't need a second
 * focal point competing with the data.
 */
export default function WireframeIcon({ size = 160, animate = true, className = "" }) {
  const gradientId = "wireframe-icon-gradient";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={`${animate ? "animate-wireframe-breathe" : ""} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="30" y1="20" x2="170" y2="180">
          <stop offset="0%" stopColor="var(--color-wireframe-end)" />
          <stop offset="100%" stopColor="var(--color-wireframe-start)" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${gradientId})`} strokeWidth="1.25" strokeLinejoin="round">
        {/* top face (rhombus) */}
        <path d="M100 20 L165 60 L100 100 L35 60 Z" />
        {/* vertical edges down to the bottom face */}
        <path d="M165 60 L165 140 M100 100 L100 180 M35 60 L35 140" />
        {/* bottom face (rhombus) */}
        <path d="M35 140 L100 180 L165 140 L100 100" />
        {/* internal faint diagonals, suggesting the far edges through the wireframe */}
        <path d="M100 20 L100 100 M35 60 L100 100 M165 60 L100 100" opacity="0.45" />
      </g>
    </svg>
  );
}
