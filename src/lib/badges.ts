import type { Sesh } from "./types";

/** Label when the latest sesh just crossed a milestone, else null. Feeds the
 *  celebration toast after logging a sesh. */
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
