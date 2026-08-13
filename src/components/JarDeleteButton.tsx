"use client";

import { useTransition } from "react";
import { deleteJar } from "@/lib/actions";

export default function JarDeleteButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Delete ${name}? Every purchase, sesh and flip in it goes too.`))
          return;
        // The prompt only collects the code — verification is server-side.
        const code = window.prompt("Admin code:");
        if (code === null) return;
        startTransition(async () => {
          const result = await deleteJar(id, code);
          if (result?.error) alert(result.error);
        });
      }}
      className="text-muted hover:text-danger hover:animate-wiggle transition text-base px-2 py-1 disabled:opacity-40"
      aria-label={`Delete ${name}`}
    >
      {pending ? "…" : "🗑"}
    </button>
  );
}
