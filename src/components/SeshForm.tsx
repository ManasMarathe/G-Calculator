"use client";

import { useActionState, useState } from "react";
import { createSesh } from "@/lib/actions";
import { grams, inr } from "@/lib/format";
import type { Member } from "@/lib/types";

export default function SeshForm({
  stash,
  rate,
  members,
}: {
  stash: number;
  rate: number;
  members: Member[];
}) {
  const [state, formAction, pending] = useActionState(createSesh, null);
  const [end, setEnd] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const endNum = Number(end);
  const validEnd = end !== "" && Number.isFinite(endNum) && endNum >= 0 && endNum < stash;
  const smoked = validEnd ? stash - endNum : null;
  const cost = smoked !== null ? smoked * rate : null;
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
      className="rounded-2xl bg-surface border border-edge p-4 flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface-2 border border-edge px-3 py-3">
          <p className="text-xs text-muted">Jar before (locked 🔒)</p>
          <p className="text-xl font-bold">{grams(stash)}</p>
        </div>
        <label className="text-xs text-muted rounded-xl bg-surface-2 border border-edge px-3 py-3 focus-within:border-accent">
          Jar after the sesh
          <input
            name="end_grams"
            type="number"
            step="0.01"
            min="0"
            max={stash}
            required
            placeholder="0.0"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full bg-transparent text-xl font-bold text-foreground outline-none placeholder:text-muted/40"
          />
        </label>
      </div>
      {end !== "" && !validEnd && (
        <p className="text-danger text-sm -mt-2">
          {endNum >= stash
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
                className={`rounded-full px-3.5 py-2 text-sm border transition active:scale-95 ${
                  on
                    ? "bg-accent text-background border-accent font-bold"
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
        placeholder="note (optional) — e.g. 'friday rooftop'"
        className="w-full rounded-xl bg-surface-2 border border-edge px-3 py-3 text-sm outline-none focus:border-accent placeholder:text-muted/50"
      />

      {smoked !== null && (
        <div className="rounded-xl bg-surface-2 border border-accent/30 px-4 py-3 text-sm">
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
      {state?.error && <p className="text-danger text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || !validEnd || picked.size === 0}
        className="rounded-xl bg-accent text-background font-bold text-lg py-4 active:scale-95 transition disabled:opacity-40"
      >
        {pending ? "logging…" : "Log the sesh 🔥"}
      </button>
    </form>
  );
}
