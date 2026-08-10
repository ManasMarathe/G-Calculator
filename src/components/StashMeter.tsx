import { grams } from "@/lib/format";

/**
 * A jar that fills with green. Fill % is stash relative to the biggest the
 * jar has ever been (max grams held at any point), so it reads as "how much
 * of a full jar is left".
 */
export default function StashMeter({ stash, maxStash }: { stash: number; maxStash: number }) {
  const pct = maxStash > 0 ? Math.max(0, Math.min(100, (stash / maxStash) * 100)) : 0;
  const mood =
    stash <= 0
      ? "bone dry 💀"
      : pct < 20
        ? "jar's looking sad 😢 — someone re-up"
        : pct < 55
          ? "getting light… 🤔"
          : "we're eating good 😤";

  return (
    <div className="rounded-2xl bg-surface border border-edge p-4 flex items-center gap-4">
      <div className="relative w-16 h-20 shrink-0" aria-hidden>
        {/* jar body */}
        <div className="absolute inset-x-0 top-2 bottom-0 rounded-b-2xl rounded-t-md border-2 border-edge bg-surface-2 overflow-hidden">
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-accent-deep to-accent transition-all"
            style={{ height: `${pct}%` }}
          />
        </div>
        {/* lid */}
        <div className="absolute inset-x-1 top-0 h-2.5 rounded-sm bg-edge" />
      </div>
      <div>
        <p className="text-3xl font-bold leading-tight">{grams(Math.max(0, stash))}</p>
        <p className="text-sm text-muted">{mood}</p>
      </div>
    </div>
  );
}
