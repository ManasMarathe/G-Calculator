import { computeBalances, settleDebts, stashGrams, avgCostPerGram } from "@/lib/calc";
import { grams, inr } from "@/lib/format";
import { getEverything } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SettlePage() {
  const { members, purchases, seshes } = await getEverything();
  const balances = computeBalances(members, purchases, seshes);
  const transfers = settleDebts(balances);
  const stash = stashGrams(purchases, seshes);
  const stashValue = stash * avgCostPerGram(purchases);
  const sorted = [...balances].sort((a, b) => b.settle - a.settle);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Settle up 🤝</h1>
        <p className="text-muted text-sm mt-1">
          buys earn credit, seshes cost your share — the {grams(stash)} still in the jar (
          {inr(stashValue)}) counts as everyone&apos;s 🍃
        </p>
      </header>

      {members.length === 0 ? (
        <div className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-6 text-center">
          <div className="text-4xl mb-2 inline-block animate-bob">👥</div>
          <p className="font-display font-bold">Nobody to settle with</p>
          <p className="text-muted text-sm mt-1">add your circle in the treasury</p>
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Balances</h2>
            <ul className="flex flex-col gap-2">
              {sorted.map((b) => (
                <li
                  key={b.member.id}
                  className="rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm px-4 py-3 flex items-center gap-3"
                >
                  <span className="text-2xl">{b.member.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{b.member.name}</p>
                    <p className="text-xs text-muted">
                      put in {inr(b.bought)} · smoked {grams(b.smokedGrams)} worth{" "}
                      {inr(b.smokedShare)}
                    </p>
                  </div>
                  <span
                    className={`font-bold ${
                      b.settle > 0.01
                        ? "text-accent-deep"
                        : b.settle < -0.01
                          ? "text-danger"
                          : "text-muted"
                    }`}
                  >
                    {b.settle > 0.01 ? `↑ ${inr(b.settle)}` : b.settle < -0.01 ? `↓ ${inr(-b.settle)}` : "even ✌️"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted px-1">
              ↑ the circle owes them · ↓ they owe the circle
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Squash the debts
            </h2>
            {transfers.length === 0 ? (
              <div className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-6 text-center">
                <div className="text-4xl mb-2 inline-block animate-bob">🧘</div>
                <p className="font-display font-bold">All square</p>
                <p className="text-muted text-sm mt-1">perfect harmony in the circle</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {transfers.map((t, i) => (
                  <li
                    key={i}
                    className="rounded-3xl bg-surface border-2 border-accent/50 shadow-sticker px-4 py-3.5 flex items-center justify-between"
                  >
                    <span>
                      {t.from.emoji} <span className="font-semibold">{t.from.name}</span>
                      <span className="text-muted mx-2">pays</span>
                      {t.to.emoji} <span className="font-semibold">{t.to.name}</span>
                    </span>
                    <span className="font-bold text-accent">{inr(t.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
