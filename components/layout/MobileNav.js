"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

/**
 * Mobile replacement for the sidebar: a fixed, horizontally scrollable
 * strip that keeps every primary section reachable without consuming
 * vertical space from the (data-dense) main content.
 */
export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 flex gap-1 overflow-x-auto border-t border-line bg-surface px-2 py-2 md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 rounded-md px-3 py-1.5 text-[11px] font-medium tracking-wide transition-colors duration-150 ${
              isActive
                ? "bg-surface-elevated text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {item.label.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
