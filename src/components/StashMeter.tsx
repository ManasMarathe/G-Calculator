import CountUp from "./CountUp";
import JarBuddy from "./JarBuddy";

/**
 * Jar Buddy's home. Fill % is stash relative to the biggest the jar has ever
 * been, so it reads as "how much of a full jar is left".
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
    <div className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-4 flex items-center gap-4">
      <JarBuddy pct={pct} />
      <div>
        <CountUp
          value={Math.max(0, stash)}
          kind="grams"
          className="font-display text-4xl font-extrabold leading-tight block"
        />
        <p className="text-sm text-muted">{mood}</p>
      </div>
    </div>
  );
}
