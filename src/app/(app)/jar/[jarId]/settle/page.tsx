import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { computeBalances, settleDebts, stashGrams, avgCostPerGram } from "@/lib/calc";
import { grams, inr } from "@/lib/format";
import { getEverything, getJarById } from "@/lib/queries";

export default async function SettlePage({ params }: { params: Promise<{ jarId: string }> }) {
  const { jarId } = await params;
  return <SettleInner jarId={jarId} />;
}

async function SettleInner({ jarId }: { jarId: string }) {
  "use cache";
  cacheLife("days");
  cacheTag("jar");
  const [jar, { members, purchases, seshes, sales }] = await Promise.all([
    getJarById(jarId),
    getEverything(jarId),
  ]);
  if (!jar) notFound();
  const balances = computeBalances(members, purchases, seshes, sales);
  const transfers = settleDebts(balances);
  const stash = stashGrams(purchases, seshes, sales);
  const stashValue = stash * avgCostPerGram(purchases);
  const sorted = [...balances].sort((a, b) => b.net - a.net);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Settle up 🤝</h1>
        <p className="text-muted text-sm mt-1">
          you owe for what you smoked, you&apos;re credited for what you bought — the{" "}
          {grams(stash)} still in the jar (≈{inr(stashValue)}) stays as the buyers&apos; credit 🍃
          {sales.length > 0 && <> · whoever made a flip holds that cash till they pay it round 💰</>}
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
                      {b.collected > 0.01 &&
                        ` · holding ${inr(b.collected)} from ${grams(b.soldGrams)} sold`}
                      {Math.abs(b.earned) > 0.01 &&
                        ` · ${b.earned >= 0 ? "+" : ""}${inr(b.earned)} profit share`}
                    </p>
                  </div>
                  <span
                    className={`font-bold ${
                      b.net > 0.01
                        ? "text-accent-deep"
                        : b.net < -0.01
                          ? "text-danger"
                          : "text-muted"
                    }`}
                  >
                    {b.net > 0.01 ? `↑ ${inr(b.net)}` : b.net < -0.01 ? `↓ ${inr(-b.net)}` : "even ✌️"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted px-1">
              ↑ the group owes them · ↓ they owe the group
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
                <p className="text-muted text-sm mt-1">
                  nobody&apos;s smoked more than they&apos;ve chipped in
                </p>
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
            {stash > 0 && (
              <p className="text-xs text-muted px-1">
                after settling, ≈{inr(stashValue)} of the buyers&apos; money is still in the jar as
                weed — it squares itself as it gets smoked 💨
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
