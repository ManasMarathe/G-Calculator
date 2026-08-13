// Instant skeleton for cache misses / cold starts, in the sticker style.
export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-busy>
      <header className="flex items-baseline justify-between py-2">
        <div className="h-8 w-40 rounded-2xl bg-surface border-2 border-edge" />
        <div className="h-4 w-20 rounded-xl bg-surface" />
      </header>

      <div className="h-40 rounded-3xl bg-surface border-2 border-edge shadow-sticker" />

      <div className="grid grid-cols-3 gap-3">
        <div className="h-20 rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm" />
        <div className="h-20 rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm" />
        <div className="h-20 rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="h-16 rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm" />
        <div className="h-16 rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm" />
        <div className="h-16 rounded-3xl bg-surface border-2 border-edge shadow-sticker-sm" />
      </div>
    </div>
  );
}
