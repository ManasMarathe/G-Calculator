// Cartoon jar with a face that reacts to how full it is. Pure SVG, no JS.
// Face lines are drawn twice (thick ink under, cream over) so they read on
// both the dark glass and the bright liquid.

type Tier = "dead" | "sad" | "chill" | "ecstatic";

const FACES: Record<Tier, string[]> = {
  // [left eye, right eye, mouth]
  dead: ["M40 72 l12 12 M52 72 l-12 12", "M68 72 l12 12 M80 72 l-12 12", "M44 92 q4 -6 8 0 t8 0 t8 0"],
  sad: ["M39 76 q7 8 14 0", "M67 76 q7 8 14 0", "M46 96 q14 -10 28 0"],
  chill: ["M40 78 h13", "M67 78 h13", "M52 90 q8 6 16 0"],
  ecstatic: ["M39 78 q7 -9 14 0", "M67 78 q7 -9 14 0", "M44 88 q16 14 32 0"],
};

export default function JarBuddy({ pct }: { pct: number }) {
  const fill = Math.max(0, Math.min(100, pct));
  const tier: Tier = fill <= 0 ? "dead" : fill < 20 ? "sad" : fill < 55 ? "chill" : "ecstatic";
  const face = FACES[tier];
  // Interior spans y 26..130 (104px tall); shift the liquid down by the empty part.
  const liquidShift = (104 * (100 - fill)) / 100;

  return (
    <svg viewBox="0 0 120 140" className="w-24 h-28 shrink-0 overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="jb-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-deep)" />
        </linearGradient>
        <clipPath id="jb-glass">
          <rect x="26" y="26" width="68" height="104" rx="14" />
        </clipPath>
      </defs>

      {/* glass body */}
      <rect x="22" y="22" width="76" height="112" rx="18" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="5" />

      {/* liquid */}
      <g clipPath="url(#jb-glass)">
        <g style={{ transform: `translateY(${liquidShift}px)` }}>
          <g className="animate-rise" style={{ transformBox: "fill-box" }}>
            <rect x="22" y="32" width="76" height="110" fill="url(#jb-liquid)" />
            {/* One slow wave only — SVG-interior animation repaints on the main
                thread every frame, so each extra animated node here is a
                permanent CPU tax. */}
            <path
              className="animate-wave"
              style={{ transformBox: "fill-box", animationDuration: "6s" }}
              d="M22 34 q17 -10 34 0 t34 0 t34 0 t34 0 t34 0 t34 0 v14 h-204 z"
              fill="var(--accent)"
            />
            {fill > 5 && (
              <>
                <circle cx="44" cy="112" r="3.5" fill="var(--accent)" opacity="0.7" />
                <circle cx="76" cy="120" r="2.5" fill="var(--accent)" opacity="0.6" />
              </>
            )}
          </g>
        </g>
        {/* glass shine */}
        <rect x="32" y="32" width="8" height="90" rx="4" fill="white" opacity="0.12" />
      </g>

      {/* face: ink underlay + cream overlay */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {face.map((d, i) => (
          <path key={`u${i}`} d={d} stroke="var(--ink)" strokeWidth="7" />
        ))}
        {face.map((d, i) => (
          <path key={`o${i}`} d={d} stroke="var(--foreground)" strokeWidth="3" />
        ))}
      </g>
      {tier === "ecstatic" && (
        <>
          <circle cx="34" cy="88" r="5" fill="var(--fire)" opacity="0.45" />
          <circle cx="86" cy="88" r="5" fill="var(--fire)" opacity="0.45" />
        </>
      )}
      {tier === "sad" && <ellipse cx="48" cy="86" rx="3" ry="4.5" fill="var(--sky)" opacity="0.9" />}

      {/* lid, slightly tilted */}
      <g transform="rotate(-3 60 14)">
        <rect x="28" y="6" width="64" height="16" rx="7" fill="var(--border)" stroke="var(--ink)" strokeWidth="5" />
        <rect x="36" y="10" width="14" height="3.5" rx="1.75" fill="white" opacity="0.25" />
      </g>

      {/* buddy's leaf */}
      <text x="92" y="12" fontSize="16">
        🍃
      </text>
    </svg>
  );
}
