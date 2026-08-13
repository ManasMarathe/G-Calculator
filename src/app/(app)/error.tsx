"use client";

// Friendly crash card — the Supabase free tier pauses itself after a week of
// silence, so the first visit after a dormant stretch can fail. Give people a
// retry button instead of an unstyled stack trace.
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-6 text-center mt-10">
      <div className="text-4xl mb-2 inline-block animate-bob">😴</div>
      <p className="font-display font-bold text-lg">Jar&apos;s asleep</p>
      <p className="text-muted text-sm mt-1 mb-4">
        the database probably dozed off — give it a nudge
      </p>
      <button
        onClick={reset}
        className="rounded-2xl bg-accent text-background font-display font-bold px-5 py-3 border-2 border-ink shadow-sticker active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
      >
        Wake it up 🔔
      </button>
    </div>
  );
}
