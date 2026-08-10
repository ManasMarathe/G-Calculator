import DeleteButton from "@/components/DeleteButton";
import MemberForm from "@/components/MemberForm";
import PurchaseForm from "@/components/PurchaseForm";
import { deletePurchase } from "@/lib/actions";
import { avgCostPerGram, stashGrams } from "@/lib/calc";
import { grams, inr, inrPrecise, shortDate } from "@/lib/format";
import { getEverything } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TreasuryPage() {
  const { members, purchases, seshes } = await getEverything();
  const stash = stashGrams(purchases, seshes);
  const rate = avgCostPerGram(purchases);
  const totalSpent = purchases.reduce((s, p) => s + p.total_cost, 0);
  const newestFirst = [...purchases].reverse();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Treasury 💰</h1>
        <p className="text-muted text-sm mt-1">
          {purchases.length > 0 ? (
            <>
              {grams(stash)} in the jar · avg {inrPrecise(rate)}/g · {inr(totalSpent)} lifetime
            </>
          ) : (
            "the war chest for the good times"
          )}
        </p>
      </header>

      {members.length === 0 ? (
        <div className="rounded-2xl bg-surface border border-edge p-6 text-center">
          <div className="text-4xl mb-2">👥</div>
          <p className="font-semibold">Add your circle first</p>
          <p className="text-muted text-sm mt-1">can&apos;t split a jar with nobody</p>
        </div>
      ) : (
        <PurchaseForm members={members} />
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">The circle</h2>
        {members.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <span
                key={m.id}
                className="rounded-full bg-surface border border-edge px-3 py-1.5 text-sm"
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
          <p className="text-muted text-sm rounded-2xl bg-surface border border-edge p-4">
            Jar&apos;s never been fed 😢 — log the first re-up above
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {newestFirst.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl bg-surface border border-edge px-4 py-3 flex items-center gap-3"
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
    </div>
  );
}
