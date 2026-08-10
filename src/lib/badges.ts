import type { Purchase, Sesh } from "./types";
import { inr } from "./format";

export type Badge = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  unlocked: boolean;
  progress?: string;
};

export function computeBadges(purchases: Purchase[], seshes: Sesh[]): Badge[] {
  const totalBurned = seshes.reduce((s, x) => s + x.grams_smoked, 0);
  const totalSpent = purchases.reduce((s, p) => s + p.total_cost, 0);
  const biggestCircle = seshes.reduce((m, s) => Math.max(m, s.participants.length), 0);
  const scraped = seshes.some((s) => s.end_grams === 0);

  return [
    {
      id: "first-buy",
      emoji: "🥦",
      title: "First Re-Up",
      desc: "fed the jar for the first time",
      unlocked: purchases.length >= 1,
    },
    {
      id: "first-sesh",
      emoji: "💨",
      title: "Cherry Popped",
      desc: "the first sesh is in the books",
      unlocked: seshes.length >= 1,
    },
    {
      id: "ten-seshes",
      emoji: "🔥",
      title: "Double Digits",
      desc: "10 seshes logged",
      unlocked: seshes.length >= 10,
      progress: seshes.length < 10 ? `${seshes.length}/10 seshes` : undefined,
    },
    {
      id: "the-answer",
      emoji: "😶‍🌫️",
      title: "The Answer",
      desc: "42 seshes. deep.",
      unlocked: seshes.length >= 42,
      progress: seshes.length < 42 ? `${seshes.length}/42 seshes` : undefined,
    },
    {
      id: "century",
      emoji: "🍃",
      title: "Century Club",
      desc: "100g burned all-time",
      unlocked: totalBurned >= 100,
      progress: totalBurned < 100 ? `${Math.round(totalBurned)}g/100g` : undefined,
    },
    {
      id: "whale-jar",
      emoji: "💸",
      title: "Whale Jar",
      desc: "₹10,000 through the treasury",
      unlocked: totalSpent >= 10000,
      progress: totalSpent < 10000 ? `${inr(totalSpent)}/${inr(10000)}` : undefined,
    },
    {
      id: "full-circle",
      emoji: "🤝",
      title: "Full Circle",
      desc: "a sesh with 5+ in rotation",
      unlocked: biggestCircle >= 5,
      progress: biggestCircle < 5 ? `best: ${biggestCircle} heads` : undefined,
    },
    {
      id: "scraped",
      emoji: "🫙",
      title: "Scraped Clean",
      desc: "smoked the jar to exactly zero",
      unlocked: scraped,
    },
  ];
}

/** Label when the latest sesh just crossed a milestone, else null. */
export function newMilestone(seshes: Sesh[]): string | null {
  const n = seshes.length;
  if (n === 0) return null;
  if (n === 1) return "💨 Cherry Popped — first sesh ever!";
  if (n === 10) return "🔥 Double Digits — 10th sesh!";
  if (n === 42) return "😶‍🌫️ The Answer — sesh #42!";

  const total = seshes.reduce((s, x) => s + x.grams_smoked, 0);
  const last = seshes[seshes.length - 1].grams_smoked;
  if (total >= 100 && total - last < 100) return "🍃 Century Club — 100g burned!";
  if (seshes[seshes.length - 1].end_grams === 0) return "🫙 Scraped Clean — not a crumb left!";
  return null;
}
