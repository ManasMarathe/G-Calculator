import type { Badge } from "@/lib/badges";

export default function Badges({ badges }: { badges: Badge[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Sticker book 🍃</h2>
      <div className="grid grid-cols-2 gap-3">
        {badges.map((b, i) =>
          b.unlocked ? (
            <div
              key={b.id}
              className={`rounded-3xl bg-surface border-2 border-edge shadow-sticker p-4 text-center ${
                i % 2 === 0 ? "rotate-1" : "-rotate-1"
              }`}
            >
              <div className="text-4xl mb-1">{b.emoji}</div>
              <p className="font-display font-bold text-accent leading-tight">{b.title}</p>
              <p className="text-xs text-muted mt-1">{b.desc}</p>
            </div>
          ) : (
            <div
              key={b.id}
              className="rounded-3xl bg-surface border-2 border-dashed border-edge p-4 text-center opacity-45 grayscale"
            >
              <div className="text-4xl mb-1">{b.emoji}</div>
              <p className="font-display font-bold leading-tight">{b.title}</p>
              <p className="text-xs text-muted mt-1">{b.progress ?? b.desc}</p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
