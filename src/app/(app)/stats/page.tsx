import { CumulativeSmokedChart, MemberGramsChart, RateTrendChart } from "@/components/Charts";
import { computeBalances, round2, stashGrams, avgCostPerGram } from "@/lib/calc";
import { grams, inr, inrPrecise, shortDate } from "@/lib/format";
import { getEverything } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const { members, purchases, seshes } = await getEverything();

  if (purchases.length === 0 && seshes.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Stats 📊</h1>
        <div className="rounded-2xl bg-surface border border-edge p-6 text-center">
          <div className="text-4xl mb-2">🦗</div>
          <p className="font-semibold">No data, no drama</p>
          <p className="text-muted text-sm mt-1">stats show up once the jar sees some action</p>
        </div>
      </div>
    );
  }

  const balances = computeBalances(members, purchases, seshes);
  const totalSmoked = seshes.reduce((s, x) => s + x.grams_smoked, 0);
  const biggest = seshes.reduce(
    (max, s) => (s.grams_smoked > (max?.grams_smoked ?? 0) ? s : max),
    seshes[0]
  );
  const avgPerSesh = seshes.length > 0 ? totalSmoked / seshes.length : 0;

  // Burn rate: grams/day since the first sesh → runway for the current stash.
  const stash = stashGrams(purchases, seshes);
  let burnRate = 0;
  if (seshes.length > 0) {
    const first = new Date(seshes[0].created_at).getTime();
    const days = Math.max(1, (Date.now() - first) / 86_400_000);
    burnRate = totalSmoked / days;
  }
  const daysLeft = burnRate > 0 ? stash / burnRate : null;

  const topBuyer = [...balances].sort((a, b) => b.bought - a.bought)[0];
  const topSmoker = [...balances].sort((a, b) => b.smokedGrams - a.smokedGrams)[0];

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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Stats 📊</h1>

      <section className="grid grid-cols-2 gap-2">
        {topBuyer && topBuyer.bought > 0 && (
          <div className="rounded-2xl bg-surface border border-edge p-4">
            <p className="text-[11px] text-muted uppercase tracking-wide">💸 Top buyer</p>
            <p className="text-lg font-bold mt-1">
              {topBuyer.member.emoji} {topBuyer.member.name}
            </p>
            <p className="text-sm text-muted">{inr(topBuyer.bought)} invested</p>
          </div>
        )}
        {topSmoker && topSmoker.smokedGrams > 0 && (
          <div className="rounded-2xl bg-surface border border-edge p-4">
            <p className="text-[11px] text-muted uppercase tracking-wide">💨 Heaviest lungs</p>
            <p className="text-lg font-bold mt-1">
              {topSmoker.member.emoji} {topSmoker.member.name}
            </p>
            <p className="text-sm text-muted">{grams(topSmoker.smokedGrams)} attributed</p>
          </div>
        )}
        <div className="rounded-2xl bg-surface border border-edge p-4">
          <p className="text-[11px] text-muted uppercase tracking-wide">🔥 Biggest sesh</p>
          <p className="text-lg font-bold mt-1">{seshes.length > 0 ? grams(biggest.grams_smoked) : "—"}</p>
          <p className="text-sm text-muted">
            {seshes.length > 0 ? shortDate(biggest.created_at) : "yet to happen"}
          </p>
        </div>
        <div className="rounded-2xl bg-surface border border-edge p-4">
          <p className="text-[11px] text-muted uppercase tracking-wide">⚖️ Avg per sesh</p>
          <p className="text-lg font-bold mt-1">{grams(avgPerSesh)}</p>
          <p className="text-sm text-muted">across {seshes.length} seshes</p>
        </div>
        {daysLeft !== null && (
          <div className="rounded-2xl bg-surface border border-edge p-4 col-span-2">
            <p className="text-[11px] text-muted uppercase tracking-wide">⏳ Jar runway</p>
            <p className="text-lg font-bold mt-1">
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

      {rateTrend.length >= 2 && (
        <section className="rounded-2xl bg-surface border border-edge p-4">
          <h2 className="text-sm font-semibold mb-1">Avg cost per gram over time</h2>
          <p className="text-xs text-muted mb-3">currently {inrPrecise(avgCostPerGram(purchases))}/g</p>
          <RateTrendChart data={rateTrend} />
        </section>
      )}

      {cumSmoked.length >= 2 && (
        <section className="rounded-2xl bg-surface border border-edge p-4">
          <h2 className="text-sm font-semibold mb-3">Total grams burned 💨</h2>
          <CumulativeSmokedChart data={cumSmoked} />
        </section>
      )}

      {memberGrams.length > 0 && (
        <section className="rounded-2xl bg-surface border border-edge p-4">
          <h2 className="text-sm font-semibold mb-3">Grams per stoner</h2>
          <MemberGramsChart data={memberGrams} />
        </section>
      )}
    </div>
  );
}
