import CountUp from "@/components/CountUp";
import { CumulativeSmokedChart, MemberGramsChart, RateTrendChart } from "@/components/Charts";
import Trophies from "@/components/Trophies";
import {
  computeBalances,
  round2,
  saleProfit,
  seshCost,
  stashGrams,
  avgCostPerGram,
} from "@/lib/calc";
import { grams, inr, inrPrecise, shortDate } from "@/lib/format";
import { getEverything } from "@/lib/queries";
import { computeTrophies } from "@/lib/trophies";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const { members, purchases, seshes, sales } = await getEverything();
  const trophies = computeTrophies(members, purchases, seshes, sales);

  if (purchases.length === 0 && seshes.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-extrabold">Stats 😶‍🌫️</h1>
        <div className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-6 text-center">
          <div className="text-4xl mb-2 inline-block animate-bob">🦗</div>
          <p className="font-display font-bold">No data, no drama</p>
          <p className="text-muted text-sm mt-1">stats show up once the jar sees some action</p>
        </div>
        <Trophies trophies={trophies} />
      </div>
    );
  }

  const balances = computeBalances(members, purchases, seshes, sales);
  const totalSmoked = seshes.reduce((s, x) => s + x.grams_smoked, 0);
  const soldGrams = sales.reduce((s, x) => s + x.grams, 0);
  const totalRevenue = sales.reduce((s, x) => s + x.total_price, 0);
  const totalProfit = sales.reduce((s, x) => s + saleProfit(x), 0);
  const biggest = seshes.reduce(
    (max, s) => (s.grams_smoked > (max?.grams_smoked ?? 0) ? s : max),
    seshes[0]
  );
  const avgPerSesh = seshes.length > 0 ? totalSmoked / seshes.length : 0;
  const avgCostPerSesh =
    seshes.length > 0 ? seshes.reduce((s, x) => s + seshCost(x), 0) / seshes.length : 0;
  const avgHeads =
    seshes.length > 0
      ? seshes.reduce((s, x) => s + x.participants.length, 0) / seshes.length
      : 0;

  // Burn rate: grams/day since the first sesh → runway for the current stash.
  // Sold grams aren't burned, so they don't move the rate — but they do shrink
  // the stash, which correctly shortens the runway.
  const stash = stashGrams(purchases, seshes, sales);
  let burnRate = 0;
  let seshesPerWeek = 0;
  if (seshes.length > 0) {
    const first = new Date(seshes[0].created_at).getTime();
    const days = Math.max(1, (Date.now() - first) / 86_400_000);
    burnRate = totalSmoked / days;
    seshesPerWeek = seshes.length / Math.max(1, days / 7);
  }
  const daysLeft = burnRate > 0 ? stash / burnRate : null;

  // Chart data (ascending time)
  let cumCost = 0;
  let cumGrams = 0;
  const rateTrend = purchases.map((p) => {
    cumCost += p.total_cost;
    cumGrams += p.grams;
    return { date: shortDate(p.created_at), rate: round2(cumCost / cumGrams) };
  });
  let running = 0;
  const cumSmoked = seshes.map((s) => {
    running += s.grams_smoked;
    return { date: shortDate(s.created_at), total: round2(running) };
  });
  const memberGrams = balances
    .filter((b) => b.smokedGrams > 0)
    .sort((a, b) => b.smokedGrams - a.smokedGrams)
    .map((b) => ({ name: `${b.member.emoji} ${b.member.name}`, grams: b.smokedGrams }));

  const tile = "rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm p-4";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-extrabold">Stats 😶‍🌫️</h1>

      <section className="grid grid-cols-2 gap-3">
        <div className={`${tile} rotate-1`}>
          <p className="text-[11px] text-muted uppercase tracking-wide">🔥 Biggest sesh</p>
          <p className="font-display text-lg font-bold mt-1">
            {seshes.length > 0 ? grams(biggest.grams_smoked) : "—"}
          </p>
          <p className="text-sm text-muted">
            {seshes.length > 0 ? shortDate(biggest.created_at) : "yet to happen"}
          </p>
        </div>
        <div className={`${tile} -rotate-1`}>
          <p className="text-[11px] text-muted uppercase tracking-wide">⚖️ Avg per sesh</p>
          <CountUp value={avgPerSesh} kind="grams" className="font-display text-lg font-bold mt-1 block" />
          <p className="text-sm text-muted">across {seshes.length} seshes</p>
        </div>
        <div className={tile}>
          <p className="text-[11px] text-muted uppercase tracking-wide">🧮 Avg sesh damage</p>
          <CountUp value={avgCostPerSesh} kind="inr" className="font-display text-lg font-bold mt-1 block" />
          <p className="text-sm text-muted">whole-sesh cost</p>
        </div>
        <div className={tile}>
          <p className="text-[11px] text-muted uppercase tracking-wide">📅 Sesh pace</p>
          <p className="font-display text-lg font-bold mt-1">
            {seshes.length > 0 ? `${round2(seshesPerWeek)}/week` : "—"}
          </p>
          <p className="text-sm text-muted">
            {seshes.length > 0 ? `~${round2(avgHeads)} heads in rotation` : "no seshes yet"}
          </p>
        </div>
        {sales.length > 0 && (
          <div className={`${tile} col-span-2`}>
            <p className="text-[11px] text-muted uppercase tracking-wide">💰 Flipped</p>
            <p className="font-display text-lg font-bold mt-1">
              {grams(soldGrams)} out for {inr(totalRevenue)}
            </p>
            <p className="text-sm text-muted">
              <span className={totalProfit >= 0 ? "text-accent-deep" : "text-danger"}>
                {totalProfit >= 0 ? "+" : ""}
                {inr(totalProfit)} profit
              </span>{" "}
              across {sales.length} flip{sales.length === 1 ? "" : "s"}
            </p>
          </div>
        )}
        {daysLeft !== null && (
          <div className={`${tile} col-span-2`}>
            <p className="text-[11px] text-muted uppercase tracking-wide">⏳ Jar runway</p>
            <p className="font-display text-lg font-bold mt-1">
              {stash <= 0
                ? "already empty 💀"
                : `~${Math.floor(daysLeft)} day${Math.floor(daysLeft) === 1 ? "" : "s"} left`}
            </p>
            <p className="text-sm text-muted">
              burning {grams(round2(burnRate))}/day on average
            </p>
          </div>
        )}
      </section>

      <Trophies trophies={trophies} />

      {rateTrend.length >= 2 && (
        <section className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-4">
          <h2 className="font-display text-sm font-bold mb-1">Avg cost per gram over time</h2>
          <p className="text-xs text-muted mb-3">currently {inrPrecise(avgCostPerGram(purchases))}/g</p>
          <RateTrendChart data={rateTrend} />
        </section>
      )}

      {cumSmoked.length >= 2 && (
        <section className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-4">
          <h2 className="font-display text-sm font-bold mb-3">Total grams burned 💨</h2>
          <CumulativeSmokedChart data={cumSmoked} />
        </section>
      )}

      {memberGrams.length > 0 && (
        <section className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-4">
          <h2 className="font-display text-sm font-bold mb-3">Grams per stoner</h2>
          <MemberGramsChart data={memberGrams} />
        </section>
      )}
    </div>
  );
}
