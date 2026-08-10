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
          placeholder="🥦"
          maxLength={4}
          className="w-14 text-center rounded-xl bg-surface-2 border-2 border-edge px-2 py-3 outline-none focus:border-accent"
        />
        <input
          name="name"
          required
          placeholder="add a homie…"
          className="flex-1 rounded-xl bg-surface-2 border-2 border-edge px-3 py-3 outline-none focus:border-accent placeholder:text-muted/50"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-surface-2 border-2 border-edge shadow-sticker-sm px-4 font-display font-bold text-accent active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition disabled:opacity-50"
        >
          +
        </button>
      </div>
      {state?.error && <p className="animate-wiggle text-danger text-sm">{state.error}</p>}
    </form>
  );
}
