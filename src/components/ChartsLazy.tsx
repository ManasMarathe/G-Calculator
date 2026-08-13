"use client";

// Client-side lazy wrapper for the recharts charts. `ssr: false` is only legal
// in a Client Component, and it keeps the ~300KB recharts chunk out of the
// /stats critical path — it streams in after the page paints.
import nextDynamic from "next/dynamic";

function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      className="animate-pulse rounded-2xl bg-surface-2"
      style={{ height }}
      aria-hidden
    />
  );
}

export const RateTrendChart = nextDynamic(
  () => import("./Charts").then((m) => m.RateTrendChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const CumulativeSmokedChart = nextDynamic(
  () => import("./Charts").then((m) => m.CumulativeSmokedChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const MemberGramsChart = nextDynamic(
  () => import("./Charts").then((m) => m.MemberGramsChart),
  { ssr: false, loading: () => <ChartSkeleton height={160} /> }
);
