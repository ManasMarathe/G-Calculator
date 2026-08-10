"use client";

import { useTransition } from "react";

export default function DeleteButton({
  action,
  confirmText,
}: {
  action: () => Promise<void>;
  confirmText: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) startTransition(() => action());
      }}
      className="text-muted hover:text-danger transition text-base px-2 py-1 disabled:opacity-40"
      aria-label="Delete"
    >
      {pending ? "…" : "🗑"}
    </button>
  );
}
