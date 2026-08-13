"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

// Suffixes under /jar/<id> — the jar prefix is derived from the pathname.
const TABS = [
  { path: "", label: "Home", emoji: "🍃" },
  { path: "/treasury", label: "Treasury", emoji: "🥦" },
  { path: "/sesh", label: "Sesh", emoji: "💨" },
  { path: "/stats", label: "Stats", emoji: "😶‍🌫️" },
  { path: "/settle", label: "Settle", emoji: "🤝" },
] as const;

export default function BottomNav() {
  return (
    // No backdrop-blur here: a fixed blur layer over the animated page makes
    // the compositor re-sample every frame on every route.
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t-2 border-edge bg-surface/95">
      <div className="max-w-md mx-auto grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {/* usePathname is runtime-only, so it lives below a Suspense boundary —
            otherwise it blocks prerendering the /sesh/[id] fallback shell. */}
        <Suspense fallback={<Tabs jarId={null} active={null} />}>
          <ActiveTabs />
        </Suspense>
      </div>
    </nav>
  );
}

function ActiveTabs() {
  // /jar/<uuid>/... → the uuid; this component only renders under /jar/.
  const pathname = usePathname();
  return <Tabs jarId={pathname.split("/")[2] ?? null} active={pathname} />;
}

function Tabs({ jarId, active }: { jarId: string | null; active: string | null }) {
  return (
    <>
      {TABS.map((tab) => {
        const href = `/jar/${jarId}${tab.path}`;
        const on = active !== null && (active === href || active === `${href}/`);
        const inner = on ? (
          <span
            key={active}
            className="animate-pop inline-block bg-accent rounded-2xl px-2.5 py-0.5 shadow-sticker-sm -rotate-2 text-base leading-tight"
          >
            {tab.emoji}
          </span>
        ) : (
          <span className="text-xl leading-none">{tab.emoji}</span>
        );
        const cls = `flex flex-col items-center gap-1 py-2.5 text-[11px] transition ${
          on ? "text-accent font-display font-bold" : "text-muted opacity-55"
        }`;
        // No jarId in the prerendered fallback shell — inert spans until
        // hydration fills the real links a beat later.
        return jarId ? (
          <Link key={tab.label} href={href} className={cls}>
            {inner}
            {tab.label}
          </Link>
        ) : (
          <span key={tab.label} className={cls}>
            {inner}
            {tab.label}
          </span>
        );
      })}
    </>
  );
}
