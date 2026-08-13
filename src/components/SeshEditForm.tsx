"use client";

import { useActionState, useState } from "react";
import { updateSesh } from "@/lib/actions";
import { grams, inr } from "@/lib/format";
import type { Member, Sesh } from "@/lib/types";

export default function SeshEditForm({ sesh, members }: { sesh: Sesh; members: Member[] }) {
  const [state, formAction, pending] = useActionState(updateSesh.bind(null, sesh.id), null);
  const [end, setEnd] = useState(String(sesh.end_grams));
  const [picked, setPicked] = useState<Set<string>>(
    () => new Set(sesh.participants.map((m) => m.id))
  );
  const [code, setCode] = useState("");

  const endNum = Number(end);
  const validEnd = end !== "" && Number.isFinite(endNum) && endNum >= 0 && endNum < sesh.start_grams;
  const smoked = validEnd ? sesh.start_grams - endNum : null;
  // Re-price at the sesh's snapshotted rate, not today's jar average.
  const cost = smoked !== null ? smoked * sesh.cost_per_gram : null;
  const perHead = cost !== null && picked.size > 0 ? cost / picked.size : null;

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <form
      action={formAction}
      className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-4 flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface-2 border-2 border-edge px-3 py-3">
          <p className="text-xs text-muted">Jar before (locked 🔒)</p>
          <p className="font-display text-xl font-bold">{grams(sesh.start_grams)}</p>
        </div>
        <label className="text-xs text-muted rounded-xl bg-surface-2 border-2 border-edge px-3 py-3 focus-within:border-accent">
          Jar after the sesh
          <input
            name="end_grams"
            type="number"
            step="0.01"
            min="0"
            max={sesh.start_grams}
            required
            placeholder="0.0"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full bg-transparent font-display text-xl font-bold text-foreground outline-none placeholder:text-muted/40"
          />
        </label>
      </div>
      {end !== "" && !validEnd && (
        <p className="animate-wiggle text-danger text-sm -mt-2">
          {endNum >= sesh.start_grams
            ? "You just stared at it? 👀 End weight must be less than the start"
            : "That's not a real weight, bro"}
        </p>
      )}

      <div>
        <p className="text-sm text-muted mb-2">Who was in rotation? 🔄</p>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const on = picked.has(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.id)}
                className={`rounded-full px-3.5 py-2 text-sm border-2 transition active:scale-95 ${
                  on
                    ? "bg-accent text-background border-ink shadow-sticker-sm font-bold -rotate-1"
                    : "bg-surface-2 border-edge text-muted"
                }`}
              >
                {m.emoji} {m.name}
              </button>
            );
          })}
        </div>
        {[...picked].map((id) => (
          <input key={id} type="hidden" name="participants" value={id} />
        ))}
      </div>

      <input
        name="note"
        defaultValue={sesh.note ?? ""}
        placeholder="note (optional) — e.g. 'friday rooftop'"
        className="w-full rounded-xl bg-surface-2 border-2 border-edge px-3 py-3 text-sm outline-none focus:border-accent placeholder:text-muted/50"
      />

      {smoked !== null && (
        <div className="rounded-xl bg-surface-2 border-2 border-accent/50 shadow-sticker-sm px-4 py-3 text-sm">
          <span className="font-bold text-accent">{grams(smoked)}</span> 💨 ≈{" "}
          <span className="font-bold">{inr(cost!)}</span>
          {perHead !== null && (
            <>
              {" "}
              → <span className="font-bold text-accent-deep">{inr(perHead)}/head</span> for{" "}
              {picked.size} {picked.size === 1 ? "lone wolf 🐺" : "stoners"}
            </>
          )}
        </div>
      )}

      <label className="text-xs text-muted rounded-xl bg-surface-2 border-2 border-edge px-3 py-3 focus-within:border-accent">
        admin code to save 🔐
        <input
          name="admin_code"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          placeholder="••••"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full bg-transparent font-display text-xl font-bold text-foreground outline-none placeholder:text-muted/40"
        />
      </label>

      {state?.error && <p className="animate-wiggle text-danger text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || !validEnd || picked.size === 0 || code.trim() === ""}
        className="rounded-2xl bg-accent text-background font-display font-bold text-lg py-4 border-2 border-ink shadow-sticker active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition disabled:opacity-40"
      >
        {pending ? "saving…" : "Save the edit ✍️"}
      </button>
    </form>
  );
}
