"use client";

import { useTransition } from "react";
import { renameJar } from "@/lib/actions";

export default function JarRenameButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next = window.prompt("New jar name:", name);
        if (next === null || next.trim() === name) return;
        startTransition(async () => {
          const result = await renameJar(id, next);
          if (result?.error) alert(result.error);
        });
      }}
      className="text-muted hover:text-accent hover:animate-wiggle transition text-base px-2 py-1 disabled:opacity-40"
      aria-label={`Rename ${name}`}
    >
      {pending ? "…" : "✏️"}
    </button>
  );
}
