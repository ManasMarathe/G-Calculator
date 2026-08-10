import Link from "next/link";
import Celebration from "@/components/Celebration";
import CountUp from "@/components/CountUp";
import FloatingSmoke from "@/components/FloatingSmoke";
import StashMeter from "@/components/StashMeter";
import { newMilestone } from "@/lib/badges";
import { avgCostPerGram, buildActivity, seshCostPerHead, stashGrams } from "@/lib/calc";
import { grams, inr, inrPrecise, shortDateTime } from "@/lib/format";
import { getEverything } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: PageProps<"/">) {
  const celebrate = (await searchParams).celebrate === "1";
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
      {celebrate && <Celebration milestone={newMilestone(seshes)} />}

      <header className="relative overflow-hidden -mx-4 px-4 py-2">
        <FloatingSmoke />
        <div className="relative flex items-baseline justify-between">
          <h1 className="font-display text-3xl font-extrabold">
            G-Tracker <span className="inline-block animate-bob">🍃</span>
          </h1>
          {rate > 0 && (
            <span className="text-sm text-muted">
              avg <span className="text-accent-deep font-semibold">{inrPrecise(rate)}/g</span>
            </span>
          )}
        </div>
      </header>

      <StashMeter stash={stash} maxStash={maxStash} />

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm px-2 py-3">
          <CountUp value={totalSmoked} kind="grams" className="text-lg font-display font-bold block" />
          <p className="text-[11px] text-muted">total burned 💨</p>
        </div>
        <div className="rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm px-2 py-3">
          <CountUp value={seshes.length} kind="int" className="text-lg font-display font-bold block" />
          <p className="text-[11px] text-muted">seshes 🔥</p>
        </div>
        <div className="rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm px-2 py-3">
          <CountUp value={totalSpent} kind="inr" className="text-lg font-display font-bold block" />
          <p className="text-[11px] text-muted">jar lifetime 💸</p>
        </div>
      </div>

      <Link
        href="/sesh"
        className="-rotate-1 rounded-2xl bg-accent text-background text-center font-display font-extrabold text-2xl py-5 border-2 border-ink shadow-sticker active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
      >
        🔥 New Sesh
      </Link>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
          The ledger — every gram accounted for
        </h2>
        {newestFirst.length === 0 ? (
          <div className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-6 text-center">
            <div className="text-4xl mb-2 animate-bob inline-block">🫙</div>
            <p className="font-display font-bold">Fresh jar, clean slate</p>
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
                className="rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm px-4 py-3 flex items-center gap-3"
              >
                <span className="text-xl">{item.kind === "purchase" ? "🥦" : "💨"}</span>
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
