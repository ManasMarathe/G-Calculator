"use client";

import { useEffect, useRef, useState } from "react";
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
  // First render (server + hydration) shows the final value — no layout shift.
  const [shown, setShown] = useState(value);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (value === 0) return;

    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setShown(value);
    };
    setShown(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <span className={`tabular-nums ${className ?? ""}`}>{FORMATTERS[kind](shown)}</span>;
}
