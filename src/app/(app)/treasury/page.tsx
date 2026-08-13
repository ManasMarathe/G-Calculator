import DeleteButton from "@/components/DeleteButton";
import MemberForm from "@/components/MemberForm";
import PurchaseForm from "@/components/PurchaseForm";
import SaleForm from "@/components/SaleForm";
import { deletePurchase, deleteSale } from "@/lib/actions";
import {
  avgCostPerGram,
  saleCostBasis,
  saleProfit,
  saleProfitPerHead,
  stashGrams,
} from "@/lib/calc";
import { grams, inr, inrPrecise, shortDate, shortDateTime } from "@/lib/format";
import { getEverything } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TreasuryPage() {
  const { members, purchases, seshes, sales } = await getEverything();
  const stash = stashGrams(purchases, seshes, sales);
  const rate = avgCostPerGram(purchases);
  const totalSpent = purchases.reduce((s, p) => s + p.total_cost, 0);
  const totalProfit = sales.reduce((s, x) => s + saleProfit(x), 0);
  const newestFirst = [...purchases].reverse();
  const salesNewestFirst = [...sales].reverse();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Treasury 🥦</h1>
        <p className="text-muted text-sm mt-1">
          {purchases.length > 0 ? (
            <>
              {grams(stash)} in the jar · avg {inrPrecise(rate)}/g · {inr(totalSpent)} lifetime
              {sales.length > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span className={totalProfit >= 0 ? "text-accent-deep" : "text-danger"}>
                    {totalProfit >= 0 ? "+" : ""}
                    {inr(totalProfit)} flipped
                  </span>
                </>
              )}
            </>
          ) : (
            "the war chest for the good times"
          )}
        </p>
      </header>

      {members.length === 0 ? (
        <div className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-6 text-center">
          <div className="text-4xl mb-2 inline-block animate-bob">👥</div>
          <p className="font-display font-bold">Add your circle first</p>
          <p className="text-muted text-sm mt-1">can&apos;t split a jar with nobody</p>
        </div>
      ) : (
        <PurchaseForm members={members} />
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">The circle</h2>
        {members.length > 0 && (
          <div className="flex flex-wrap gap-2.5 py-1">
            {members.map((m, i) => (
              <span
                key={m.id}
                className={`rounded-full bg-surface border-2 border-edge shadow-sticker-sm px-3 py-1.5 text-sm ${
                  i % 2 === 0 ? "rotate-1" : "-rotate-1"
                }`}
              >
                {m.emoji} {m.name}
              </span>
            ))}
          </div>
        )}
        <MemberForm />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Buy history</h2>
        {newestFirst.length === 0 ? (
          <p className="text-muted text-sm rounded-3xl bg-surface border-2 border-edge shadow-sticker p-4">
            Jar&apos;s never been fed 😢 — log the first re-up above
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {newestFirst.map((p) => (
              <li
                key={p.id}
                className="rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm px-4 py-3 flex items-center gap-3"
              >
                <span className="text-2xl">{p.member.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {p.member.name} <span className="text-muted font-normal">re-upped</span>{" "}
                    {grams(p.grams)}
                  </p>
                  <p className="text-xs text-muted">
                    {inr(p.total_cost)} · {inrPrecise(p.total_cost / p.grams)}/g ·{" "}
                    {shortDate(p.created_at)}
                    {p.note ? ` · “${p.note}”` : ""}
                  </p>
                </div>
                <DeleteButton
                  action={deletePurchase.bind(null, p.id)}
                  confirmText={`Delete ${p.member.name}'s ${grams(p.grams)} buy? This can't be undone.`}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Flip it 💰</h2>
        <p className="text-xs text-muted px-1 -mt-1">
          sell some of the jar at cost or above — never at a loss. the seller holds the cash, the
          profit splits equally between whoever you pick
        </p>
        {members.length > 0 && stash > 0 && rate > 0 ? (
          <SaleForm stash={stash} rate={rate} members={members} />
        ) : (
          <p className="text-muted text-sm rounded-3xl bg-surface border-2 border-edge shadow-sticker p-4">
            {members.length === 0
              ? "add the circle first 👥"
              : "nothing in the jar to flip 🫙 — re-up above"}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Flip history</h2>
        {salesNewestFirst.length === 0 ? (
          <p className="text-muted text-sm rounded-3xl bg-surface border-2 border-edge shadow-sticker p-4">
            No flips yet — this jar is purely recreational 🧘
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {salesNewestFirst.map((s) => {
              const profit = saleProfit(s);
              return (
                <li
                  key={s.id}
                  className="rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💰</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {s.seller.emoji} {s.seller.name}{" "}
                        <span className="text-muted font-normal">flipped</span> {grams(s.grams)}{" "}
                        <span className="text-muted font-normal">for</span> {inr(s.total_price)}
                      </p>
                      <p className="text-xs text-muted">
                        cost {inr(saleCostBasis(s))} @{inrPrecise(s.cost_per_gram)}/g ·{" "}
                        <span className={profit >= 0 ? "text-accent-deep" : "text-danger"}>
                          {profit >= 0 ? "+" : ""}
                          {inr(profit)}
                        </span>{" "}
                        · {shortDateTime(s.created_at)}
                        {s.note ? ` · “${s.note}”` : ""}
                      </p>
                    </div>
                    <DeleteButton
                      action={deleteSale.bind(null, s.id)}
                      confirmText={`Delete ${s.seller.name}'s ${grams(s.grams)} flip? The grams go back in the jar and the profit split is undone.`}
                    />
                  </div>
                  <p className="text-xs mt-2 text-muted">
                    {inr(saleProfitPerHead(s))}/head →{" "}
                    {s.beneficiaries.map((m) => `${m.emoji} ${m.name}`).join(" · ")}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
