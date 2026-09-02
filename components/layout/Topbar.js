import Link from "next/link";
import LiveIndicator from "@/components/ui/LiveIndicator";

/**
 * Persistent top bar: product identity, live status, quick settings
 * access. Stays server-rendered — no client state required here.
 */
export default function Topbar() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-surface px-4">
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-semibold tracking-widest text-text-primary">
          MICROCAP ENGINE
        </span>
      </div>

      <div className="flex items-center gap-4">
        <LiveIndicator active />
        <Link
          href="/settings"
          className="text-xs font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
        >
          Settings
        </Link>
      </div>
    </header>
  );
}
