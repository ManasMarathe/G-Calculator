"use client";

import { useEffect, useRef, useState } from "react";

const CAST = ["🍃", "🥦", "💨", "🔥"];
const PIECES = 28;

type Piece = {
  emoji: string;
  left: string;
  tx: string;
  rot: string;
  scale: number;
  duration: string;
  delay: string;
};

export default function Celebration({ milestone }: { milestone?: string | null }) {
  const ran = useRef(false);
  const [pieces, setPieces] = useState<Piece[] | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    // Clean the URL so refresh/back never re-fires the party.
    window.history.replaceState(null, "", window.location.pathname);

    if (milestone) setShowToast(true);
    const toastTimer = setTimeout(() => setShowToast(false), 3500);

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPieces(
        Array.from({ length: PIECES }, (_, i) => ({
          emoji: CAST[i % CAST.length],
          left: `${Math.random() * 100}%`,
          tx: `${(Math.random() - 0.5) * 24}vw`,
          rot: `${(Math.random() - 0.5) * 1440}deg`,
          scale: 0.7 + Math.random() * 0.7,
          duration: `${1.4 + Math.random()}s`,
          delay: `${Math.random() * 0.4}s`,
        }))
      );
    }
    const confettiTimer = setTimeout(() => setPieces(null), 3000);
    return () => {
      clearTimeout(toastTimer);
      clearTimeout(confettiTimer);
    };
  }, [milestone]);

  return (
    <>
      {pieces && (
        <div aria-hidden className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {pieces.map((p, i) => (
            <span
              key={i}
              className="absolute top-0 text-2xl"
              style={{
                left: p.left,
                ["--tx" as string]: p.tx,
                ["--rot" as string]: p.rot,
                ["--s" as string]: p.scale,
                animation: `confetti-fall ${p.duration} ${p.delay} ease-in both`,
              }}
            >
              {p.emoji}
            </span>
          ))}
        </div>
      )}
      {showToast && milestone && (
        <div className="fixed inset-x-0 top-1/3 z-[101] flex justify-center pointer-events-none px-6">
          <div className="animate-pop rounded-3xl bg-surface border-2 border-edge shadow-sticker px-6 py-4 text-center">
            <p className="font-display font-extrabold text-xl text-accent">{milestone}</p>
          </div>
        </div>
      )}
    </>
  );
}
