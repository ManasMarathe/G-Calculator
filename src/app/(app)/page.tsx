import Link from "next/link";
import StashMeter from "@/components/StashMeter";
import { avgCostPerGram, buildActivity, seshCostPerHead, stashGrams } from "@/lib/calc";
import { grams, inr, inrPrecise, shortDateTime } from "@/lib/format";
import { getEverything } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { purchases, seshes } = await getEverything();
  const stash = stashGrams(purchases, seshes);
  const rate = avgCostPerGram(purchases);
  const activity = buildActivity(purchases, seshes);
  const maxStash = activity.reduce((m, a) => Math.max(m, a.stashAfter), 0);
  const totalSmoked = seshes.reduce((s, x) => s + x.grams_smoked, 0);
  const totalSpent = purchases.reduce((s, p) => s + p.total_cost, 0);
  const newestFirst = [...activity].reverse();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">G-Tracker 🌿</h1>
        {rate > 0 && (
          <span className="text-sm text-muted">
            avg <span className="text-accent-deep font-semibold">{inrPrecise(rate)}/g</span>
          </span>
        )}
      </header>

      <StashMeter stash={stash} maxStash={maxStash} />

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-surface border border-edge px-2 py-3">
          <p className="text-lg font-bold">{grams(totalSmoked)}</p>
          <p className="text-[11px] text-muted">total burned 💨</p>
        </div>
        <div className="rounded-2xl bg-surface border border-edge px-2 py-3">
          <p className="text-lg font-bold">{seshes.length}</p>
          <p className="text-[11px] text-muted">seshes 🔥</p>
        </div>
        <div className="rounded-2xl bg-surface border border-edge px-2 py-3">
          <p className="text-lg font-bold">{inr(totalSpent)}</p>
          <p className="text-[11px] text-muted">jar lifetime 💸</p>
        </div>
      </div>

      <Link
        href="/sesh"
        className="rounded-2xl bg-accent text-background text-center font-bold text-xl py-5 active:scale-95 transition shadow-lg shadow-accent/20"
      >
        🔥 New Sesh
      </Link>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
          The ledger — every gram accounted for
        </h2>
        {newestFirst.length === 0 ? (
          <div className="rounded-2xl bg-surface border border-edge p-6 text-center">
            <div className="text-4xl mb-2">🫙</div>
            <p className="font-semibold">Fresh jar, clean slate</p>
            <p className="text-muted text-sm mt-1">
              head to the <Link href="/treasury" className="text-accent underline">treasury</Link> to
              log the first buy
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {newestFirst.map((item) => (
              <li
                key={item.kind === "purchase" ? item.purchase.id : item.sesh.id}
                className="rounded-2xl bg-surface border border-edge px-4 py-3 flex items-center gap-3"
              >
                <span className="text-xl">{item.kind === "purchase" ? "🛒" : "💨"}</span>
                <div className="flex-1 min-w-0">
                  {item.kind === "purchase" ? (
                    <p className="text-sm">
                      <span className="font-semibold">
                        {item.purchase.member.emoji} {item.purchase.member.name}
                      </span>{" "}
                      added {grams(item.purchase.grams)} for {inr(item.purchase.total_cost)}
                    </p>
                  ) : (
                    <p className="text-sm">
                      <span className="font-semibold">{item.sesh.participants.length} in rotation</span>{" "}
                      burned {grams(item.sesh.grams_smoked)} · {inr(seshCostPerHead(item.sesh))}/head
                    </p>
                  )}
                  <p className="text-xs text-muted">{shortDateTime(item.at)}</p>
                </div>
                <span
                  className={`text-xs font-mono shrink-0 ${
                    item.kind === "purchase" ? "text-accent-deep" : "text-muted"
                  }`}
                >
                  🫙 {grams(item.stashAfter)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
