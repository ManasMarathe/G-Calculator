"use client";

import { useActionState, useState } from "react";
import { addPurchase } from "@/lib/actions";
import { inrPrecise } from "@/lib/format";
import type { Member } from "@/lib/types";

export default function PurchaseForm({ members }: { members: Member[] }) {
  const [state, formAction, pending] = useActionState(addPurchase, null);
  const [grams, setGrams] = useState("");
  const [cost, setCost] = useState("");

  const g = Number(grams);
  const c = Number(cost);
  const rate = g > 0 && c > 0 ? c / g : null;

  return (
    <form
      action={formAction}
      className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-4 flex flex-col gap-3"
    >
      <label className="text-sm text-muted">
        Who&apos;s the plug hero? 🦸
        <select
          name="member_id"
          required
          className="mt-1 w-full rounded-xl bg-surface-2 border-2 border-edge px-3 py-3 text-foreground outline-none focus:border-accent"
        >
          <option value="">pick a member…</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.emoji} {m.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-muted">
          Grams 🥦
          <input
            name="grams"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="3.5"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="mt-1 w-full rounded-xl bg-surface-2 border-2 border-edge px-3 py-3 outline-none focus:border-accent"
          />
        </label>
        <label className="text-sm text-muted">
          Damage ₹
          <input
            name="total_cost"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="900"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="mt-1 w-full rounded-xl bg-surface-2 border-2 border-edge px-3 py-3 outline-none focus:border-accent"
          />
        </label>
      </div>

      <input
        name="note"
        placeholder="note (optional) — e.g. 'the good stuff'"
        className="w-full rounded-xl bg-surface-2 border-2 border-edge px-3 py-3 text-sm outline-none focus:border-accent placeholder:text-muted/50"
      />

      {rate !== null && (
        <p className="text-sm text-accent-deep">
          that&apos;s {inrPrecise(rate)}/g — {rate > 1000 ? "premium shelf huh 💎" : "solid deal 👌"}
        </p>
      )}
      {state?.error && <p className="animate-wiggle text-danger text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl bg-accent text-background font-display font-bold py-3.5 border-2 border-ink shadow-sticker active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition disabled:opacity-50"
      >
        {pending ? "stashing…" : "Add to jar 🫙"}
      </button>
    </form>
  );
}
