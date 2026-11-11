"use client";
// S-1–S-6 navigation: floating Explore · Saved · About bar (ui-ux.md §4).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkIcon, InfoIcon, MapIcon } from "./icons";

const TABS = [
  { href: "/", label: "Explore", Icon: MapIcon },
  { href: "/saved", label: "Saved", Icon: BookmarkIcon },
  { href: "/about", label: "About", Icon: InfoIcon },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-4 bottom-4 z-[1100] mx-auto grid h-[62px] max-w-[calc(36rem-2rem)] grid-cols-3 rounded-[20px] border border-line bg-surface shadow-lg"
    >
      {TABS.map(({ href, label, Icon }) => {
        const current = path === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${current ? "text-accent-text" : "text-muted"}`}
          >
            <Icon width={22} height={22} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
