const WISPS = [
  { emoji: "💨", top: "8%", delay: "0s", duration: "16s", size: "text-3xl" },
  { emoji: "😶‍🌫️", top: "30%", delay: "4s", duration: "20s", size: "text-2xl" },
  { emoji: "💨", top: "55%", delay: "9s", duration: "14s", size: "text-4xl" },
  { emoji: "😶‍🌫️", top: "75%", delay: "12s", duration: "22s", size: "text-3xl" },
];

/** Ambient smoke drifting across its (relative, overflow-hidden) parent. */
export default function FloatingSmoke() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {WISPS.map((w, i) => (
        <span
          key={i}
          className={`absolute animate-drift opacity-30 blur-[1px] ${w.size}`}
          style={{ top: w.top, animationDelay: w.delay, animationDuration: w.duration }}
        >
          {w.emoji}
        </span>
      ))}
    </div>
  );
}
