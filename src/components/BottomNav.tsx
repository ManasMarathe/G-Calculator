"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home", emoji: "🍃" },
  { href: "/treasury", label: "Treasury", emoji: "🥦" },
  { href: "/sesh", label: "Sesh", emoji: "💨" },
  { href: "/stats", label: "Stats", emoji: "😶‍🌫️" },
  { href: "/settle", label: "Settle", emoji: "🤝" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    // No backdrop-blur here: a fixed blur layer over the animated page makes
    // the compositor re-sample every frame on every route.
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t-2 border-edge bg-surface/95">
      <div className="max-w-md mx-auto grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] transition ${
                active ? "text-accent font-display font-bold" : "text-muted opacity-55"
              }`}
            >
              {active ? (
                <span
                  key={pathname}
                  className="animate-pop inline-block bg-accent rounded-2xl px-2.5 py-0.5 shadow-sticker-sm -rotate-2 text-base leading-tight"
                >
                  {tab.emoji}
                </span>
              ) : (
                <span className="text-xl leading-none">{tab.emoji}</span>
              )}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
