"use client";

import { useActionState } from "react";
import { createJar } from "@/lib/actions";

export default function JarForm() {
  const [state, formAction, pending] = useActionState(createJar, null);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="emoji"
          placeholder="🫙"
          maxLength={4}
          className="w-16 text-center rounded-xl bg-surface-2 border-2 border-edge px-2 py-3 text-lg outline-none focus:border-accent placeholder:text-muted/50"
        />
        <input
          name="name"
          placeholder="new jar name — e.g. 'road trip stash'"
          required
          maxLength={30}
          className="flex-1 rounded-xl bg-surface-2 border-2 border-edge px-3 py-3 text-sm outline-none focus:border-accent placeholder:text-muted/50"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-surface-2 border-2 border-edge shadow-sticker-sm px-4 font-display font-bold text-accent active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition disabled:opacity-50"
        >
          {pending ? "…" : "+ jar"}
        </button>
      </div>
      {state?.error && <p className="animate-wiggle text-danger text-sm">{state.error}</p>}
    </form>
  );
}
