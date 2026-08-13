import Link from "next/link";
import { notFound } from "next/navigation";
import SeshEditForm from "@/components/SeshEditForm";
import { seshCost } from "@/lib/calc";
import { grams, inr, inrPrecise, shortDateTime } from "@/lib/format";
import { getMembers, getSeshById } from "@/lib/queries";

// Deliberately NOT cached: an edit screen wants a fresh prefill, and the
// (app)/loading.tsx boundary already covers the dynamic read.
export default async function SeshDetailPage({
  params,
}: {
  params: Promise<{ jarId: string; seshId: string }>;
}) {
  const { jarId, seshId } = await params;
  const [sesh, members] = await Promise.all([getSeshById(seshId), getMembers()]);
  // A sesh reached through the wrong jar's URL is a 404, not a leak.
  if (!sesh || sesh.jar_id !== jarId) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link href={`/jar/${jarId}/sesh`} className="text-sm text-muted hover:text-accent transition">
          ← back to seshes
        </Link>
        <h1 className="font-display text-3xl font-extrabold mt-1">Edit sesh ✍️</h1>
        <p className="text-muted text-sm mt-1">{shortDateTime(sesh.created_at)}</p>
      </header>

      <div className="rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm px-4 py-3 text-sm">
        <p className="text-[11px] text-muted uppercase tracking-wide mb-1">Locked facts 🔒</p>
        <p>
          started at <span className="font-bold">{grams(sesh.start_grams)}</span> · rate{" "}
          <span className="font-bold">{inrPrecise(sesh.cost_per_gram)}/g</span> · currently{" "}
          <span className="font-bold text-accent">{grams(sesh.grams_smoked)}</span> burned ≈{" "}
          <span className="font-bold">{inr(seshCost(sesh))}</span>
        </p>
      </div>

      <SeshEditForm sesh={sesh} members={members} />
    </div>
  );
}
