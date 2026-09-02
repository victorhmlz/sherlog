"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

/**
 * Persistent desktop/tablet sidebar. Hidden below `md`; MobileNav takes
 * over primary navigation on small viewports.
 */
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-line bg-surface md:flex md:flex-col">
      <nav aria-label="Primary" className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-[13px] font-medium tracking-wide transition-colors duration-150 ${
                isActive
                  ? "border-l-2 border-accent bg-surface-elevated pl-[10px] text-text-primary"
                  : "border-l-2 border-transparent pl-[10px] text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
              }`}
            >
              {item.label.toUpperCase()}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
