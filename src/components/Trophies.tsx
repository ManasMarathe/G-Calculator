import type { Trophy } from "@/lib/trophies";

export default function Trophies({ trophies }: { trophies: Trophy[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Trophy shelf 🏆</h2>
      {trophies.length === 0 ? (
        <div className="rounded-3xl bg-surface border-2 border-dashed border-edge p-6 text-center">
          <div className="text-4xl mb-2 inline-block animate-bob">🏆</div>
          <p className="font-display font-bold">Nobody&apos;s earned anything yet</p>
          <p className="text-muted text-sm mt-1">get to work 💪</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {trophies.map((t, i) => (
            <div
              key={t.id}
              className={`rounded-3xl bg-surface border-2 border-edge shadow-sticker p-4 text-center ${
                i % 2 === 0 ? "rotate-1" : "-rotate-1"
              }`}
            >
              <div className="text-4xl mb-1">{t.emoji}</div>
              <p className="font-display font-bold text-accent leading-tight">{t.title}</p>
              <p className="font-semibold text-sm mt-1.5">
                {t.winner.emoji} {t.winner.name}
              </p>
              <p className="text-xs text-muted mt-0.5">{t.value}</p>
              <p className="text-[11px] text-muted/70 mt-1 italic">{t.desc}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
