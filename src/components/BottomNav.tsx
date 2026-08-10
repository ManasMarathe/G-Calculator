"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home", emoji: "🏠" },
  { href: "/treasury", label: "Treasury", emoji: "💰" },
  { href: "/sesh", label: "Sesh", emoji: "💨" },
  { href: "/stats", label: "Stats", emoji: "📊" },
  { href: "/settle", label: "Settle", emoji: "🤝" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-edge bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      <div className="max-w-md mx-auto grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition ${
                active ? "text-accent font-semibold" : "text-muted"
              }`}
            >
              <span className={`text-xl leading-none ${active ? "" : "grayscale opacity-70"}`}>
                {tab.emoji}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
