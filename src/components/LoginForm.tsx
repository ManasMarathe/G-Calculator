"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="relative w-full max-w-xs flex flex-col gap-4">
      <input
        name="pin"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        placeholder="• • • •"
        className="w-full text-center text-3xl tracking-[0.5em] rounded-3xl bg-surface border-2 border-edge shadow-sticker px-4 py-4 outline-none focus:border-accent placeholder:text-muted/40"
      />
      {state?.error && (
        <p className="animate-wiggle text-center text-danger text-sm">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl bg-accent text-background font-display font-bold text-lg py-4 border-2 border-ink shadow-sticker active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition disabled:opacity-50"
      >
        {pending ? "checking…" : "Let me in 💨"}
      </button>
    </form>
  );
}
