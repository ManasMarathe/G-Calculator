import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import SeshForm from "@/components/SeshForm";
import { deleteSesh } from "@/lib/actions";
import { avgCostPerGram, seshCostPerHead, stashGrams } from "@/lib/calc";
import { grams, inr, inrPrecise, shortDateTime } from "@/lib/format";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getEverything, getJarById } from "@/lib/queries";

export default async function SeshPage({ params }: { params: Promise<{ jarId: string }> }) {
  const { jarId } = await params;
  return <SeshInner jarId={jarId} />;
}

async function SeshInner({ jarId }: { jarId: string }) {
  "use cache";
  cacheLife("days");
  cacheTag("jar");
  const [jar, { members, purchases, seshes, sales }] = await Promise.all([
    getJarById(jarId),
    getEverything(jarId),
  ]);
  if (!jar) notFound();
  const stash = stashGrams(purchases, seshes, sales);
  const rate = avgCostPerGram(purchases);
  const canSesh = stash > 0 && rate > 0 && members.length > 0;
  const newestFirst = [...seshes].reverse();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">New Sesh 💨</h1>
        <p className="text-muted text-sm mt-1">
          start weight is locked to the jar — every gram stays accounted for
        </p>
      </header>

      {canSesh ? (
        <SeshForm jarId={jarId} stash={stash} rate={rate} members={members} />
      ) : (
        <div className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-6 text-center">
          <div className="text-4xl mb-2 inline-block animate-bob">🥲</div>
          <p className="font-display font-bold">Jar&apos;s empty</p>
          <p className="text-muted text-sm mt-1 mb-4">
            {members.length === 0
              ? "no members yet — set up the circle first"
              : "somebody needs to re-up before the next rotation"}
          </p>
          <Link
            href={`/jar/${jarId}/treasury`}
            className="inline-block rounded-2xl bg-accent text-background font-display font-bold px-5 py-3 border-2 border-ink shadow-sticker active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
          >
            To the treasury 🥦
          </Link>
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Past seshes</h2>
        {newestFirst.length === 0 ? (
          <p className="text-muted text-sm rounded-3xl bg-surface border-2 border-edge shadow-sticker p-4">
            No seshes yet… sus 🤨
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {newestFirst.map((s) => (
              <li key={s.id} className="rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm px-4 py-3">
                <div className="flex items-center gap-3">
                  {/* Body links to the edit page; DeleteButton stays a sibling
                      outside the anchor. */}
                  <Link
                    href={`/jar/${jarId}/sesh/${s.id}`}
                    className="flex flex-1 min-w-0 items-center gap-3"
                  >
                    <span className="text-2xl">💨</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">
                        {grams(s.grams_smoked)} burned{" "}
                        <span className="text-muted font-normal">
                          · {inr(seshCostPerHead(s))}/head
                        </span>
                      </p>
                      <p className="text-xs text-muted">
                        {grams(s.start_grams)} → {grams(s.end_grams)} · @{inrPrecise(s.cost_per_gram)}
                        /g · {shortDateTime(s.created_at)}
                        {s.note ? ` · “${s.note}”` : ""}
                      </p>
                    </div>
                  </Link>
                  <DeleteButton
                    action={deleteSesh.bind(null, s.id)}
                    confirmText={`Delete this ${grams(s.grams_smoked)} sesh? The grams go back in the jar.`}
                  />
                </div>
                <p className="text-xs mt-2 text-muted">
                  {s.participants.map((m) => `${m.emoji} ${m.name}`).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
