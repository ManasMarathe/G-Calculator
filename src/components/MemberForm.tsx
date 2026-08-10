"use client";

import { useActionState, useRef, useEffect } from "react";
import { addMember } from "@/lib/actions";

export default function MemberForm() {
  const [state, formAction, pending] = useActionState(addMember, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="emoji"
          placeholder="🌿"
          maxLength={4}
          className="w-14 text-center rounded-xl bg-surface-2 border border-edge px-2 py-3 outline-none focus:border-accent"
        />
        <input
          name="name"
          required
          placeholder="add a homie…"
          className="flex-1 rounded-xl bg-surface-2 border border-edge px-3 py-3 outline-none focus:border-accent placeholder:text-muted/50"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-surface-2 border border-edge px-4 font-bold text-accent active:scale-95 transition disabled:opacity-50"
        >
          +
        </button>
      </div>
      {state?.error && <p className="text-danger text-sm">{state.error}</p>}
    </form>
  );
}
