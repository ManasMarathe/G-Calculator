"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createSale } from "@/lib/actions";
import { grams, inr, inrPrecise } from "@/lib/format";
import type { Member } from "@/lib/types";

export default function SaleForm({
  stash,
  rate,
  members,
}: {
  stash: number;
  rate: number;
  members: Member[];
}) {
  const [state, formAction, pending] = useActionState(createSale, null);
  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  // Everyone's in by default — the usual case is the whole circle splitting it.
  const [picked, setPicked] = useState<Set<string>>(new Set(members.map((m) => m.id)));

  // null back from the action means it saved — clear the inputs and the chips.
  // The `submitted` ref keeps this from firing on mount, where state is also null.
  useEffect(() => {
    if (state === null && submitted.current) {
      submitted.current = false;
      formRef.current?.reset();
      setAmount("");
      setPrice("");
      setPicked(new Set(members.map((m) => m.id)));
    }
  }, [state, members]);

  const g = Number(amount);
  const p = Number(price);
  const validG = amount !== "" && Number.isFinite(g) && g > 0 && g - stash <= 0.001;
  const validP = price !== "" && Number.isFinite(p) && p > 0;
  const basis = validG ? g * rate : null;
  const profit = basis !== null && validP ? p - basis : null;
  // House rule: break-even is fine, below cost is not.
  const belowCost = profit !== null && profit < -0.005;
  const perHead = profit !== null && picked.size > 0 ? profit / picked.size : null;
  const allOn = members.length > 0 && picked.size === members.length;

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <form
      ref={formRef}
      action={(fd) => {
        submitted.current = true;
        return formAction(fd);
      }}
      className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-4 flex flex-col gap-4"
    >
      <label className="text-sm text-muted">
        Who moved it? (they&apos;re holding the cash 💵)
        <select
          name="sold_by"
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
        <label className="text-xs text-muted rounded-xl bg-surface-2 border-2 border-edge px-3 py-3 focus-within:border-accent">
          Grams out (max {grams(stash)})
          <input
            name="grams"
            type="number"
            step="0.01"
            min="0.01"
            max={stash}
            required
            placeholder="1.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent font-display text-xl font-bold text-foreground outline-none placeholder:text-muted/40"
          />
        </label>
        <label className="text-xs text-muted rounded-xl bg-surface-2 border-2 border-edge px-3 py-3 focus-within:border-accent">
          Sold for ₹{basis !== null && ` (min ${inr(basis)})`}
          <input
            name="total_price"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="1200"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-transparent font-display text-xl font-bold text-foreground outline-none placeholder:text-muted/40"
          />
        </label>
      </div>
      {amount !== "" && !validG && (
        <p className="animate-wiggle text-danger text-sm -mt-2">
          {g > stash ? `Only ${grams(stash)} in the jar, bro 🫙` : "That's not a real weight"}
        </p>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted">Who eats the profit? 🤑</p>
          <button
            type="button"
            onClick={() => setPicked(allOn ? new Set() : new Set(members.map((m) => m.id)))}
            className="text-xs text-accent underline"
          >
            {allOn ? "none" : "everyone"}
          </button>
        </div>
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
          <input key={id} type="hidden" name="beneficiaries" value={id} />
        ))}
      </div>

      <input
        name="note"
        placeholder="note (optional) — e.g. 'sold to the neighbours'"
        className="w-full rounded-xl bg-surface-2 border-2 border-edge px-3 py-3 text-sm outline-none focus:border-accent placeholder:text-muted/50"
      />

      {basis !== null && (
        <div className="rounded-xl bg-surface-2 border-2 border-accent/50 shadow-sticker-sm px-4 py-3 text-sm flex flex-col gap-1">
          <p className="text-xs text-muted">
            {grams(g)} cost the jar {inr(basis)} (@{inrPrecise(rate)}/g)
          </p>
          {profit !== null && !belowCost && (
            <p>
              profit{" "}
              <span className="font-bold text-accent">{inr(profit)}</span>
              {profit < 0.005 ? (
                <span className="text-muted"> — break-even, nothing to split 🤷</span>
              ) : (
                perHead !== null && (
                  <>
                    {" "}
                    → <span className="font-bold text-accent-deep">{inr(perHead)}/head</span> across{" "}
                    {picked.size} {picked.size === 1 ? "lone shark 🦈" : "homies"}
                  </>
                )
              )}
            </p>
          )}
          {belowCost && (
            <p className="animate-wiggle text-danger">
              ⛔ that&apos;s <span className="font-bold">{inr(-profit!)}</span> under cost — no
              selling at a loss. Ask <span className="font-bold">{inr(basis)}</span> or more
            </p>
          )}
        </div>
      )}
      {state?.error && <p className="animate-wiggle text-danger text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || !validG || !validP || belowCost || picked.size === 0}
        className="rounded-2xl bg-accent text-background font-display font-bold text-lg py-4 border-2 border-ink shadow-sticker active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition disabled:opacity-40"
      >
        {pending ? "cashing out…" : "Log the flip 💰"}
      </button>
    </form>
  );
}
