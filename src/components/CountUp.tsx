"use client";

import { useEffect, useRef } from "react";
import { grams, inr, inrPrecise } from "@/lib/format";

const FORMATTERS = {
  grams,
  inr,
  inrPrecise,
  int: (n: number) => String(Math.round(n)),
} as const;

export default function CountUp({
  value,
  kind = "int",
  className,
  durationMs = 900,
}: {
  value: number;
  kind?: keyof typeof FORMATTERS;
  className?: string;
  durationMs?: number;
}) {
  // The animation writes textContent directly — setState per rAF frame would
  // re-render React ~54 times per instance right as the page hydrates.
  const ref = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (value === 0) return;
    const el = ref.current;
    if (!el) return;

    const format = FORMATTERS[kind];
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, kind, durationMs]);

  // Server render and hydration show the final value — no layout shift, and
  // reduced-motion users simply keep it.
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {FORMATTERS[kind](value)}
    </span>
  );
}
