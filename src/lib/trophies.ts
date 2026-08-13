import { computeBalances, round2, saleProfit } from "./calc";
import { grams, inr } from "./format";
import type { Member, Purchase, Sale, Sesh } from "./types";

export type Trophy = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  winner: Member;
  value: string;
};

/** Pick the member with the highest score; null unless someone is above zero. */
function top<T extends { score: number; member: Member }>(rows: T[]): T | null {
  const best = rows.reduce<T | null>((a, b) => (b.score > (a?.score ?? 0) ? b : a), null);
  return best && best.score > 0 ? best : null;
}

export function computeTrophies(
  members: Member[],
  purchases: Purchase[],
  seshes: Sesh[],
  sales: Sale[],
  // Callers that already ran computeBalances can pass it in to skip the
  // O(members × seshes) pass here.
  balances = computeBalances(members, purchases, seshes, sales)
): Trophy[] {
  const trophies: Trophy[] = [];

  const refilled = top(
    members.map((member) => ({
      member,
      score: purchases
        .filter((p) => p.member_id === member.id)
        .reduce((s, p) => s + p.grams, 0),
    }))
  );
  if (refilled)
    trophies.push({
      id: "jar-hero",
      emoji: "🏆",
      title: "Jar Hero",
      desc: "keeps the jar alive",
      winner: refilled.member,
      value: `${grams(refilled.score)} refilled`,
    });

  const spender = top(balances.map((b) => ({ member: b.member, score: b.bought })));
  if (spender)
    trophies.push({
      id: "big-spender",
      emoji: "💸",
      title: "Big Spender",
      desc: "most ₹ into the treasury",
      winner: spender.member,
      value: `${inr(spender.score)} in`,
    });

  const lungs = top(balances.map((b) => ({ member: b.member, score: b.smokedGrams })));
  if (lungs)
    trophies.push({
      id: "heaviest-lungs",
      emoji: "💨",
      title: "Heaviest Lungs",
      desc: "most grams to their name",
      winner: lungs.member,
      value: `${grams(lungs.score)} smoked`,
    });

  const fiend = top(
    members.map((member) => ({
      member,
      score: seshes.filter((s) => s.participants.some((m) => m.id === member.id)).length,
    }))
  );
  if (fiend)
    trophies.push({
      id: "sesh-fiend",
      emoji: "🔥",
      title: "Sesh Fiend",
      desc: "never misses a rotation",
      winner: fiend.member,
      value: `${fiend.score} sesh${fiend.score === 1 ? "" : "es"}`,
    });

  const whale = purchases.reduce<Purchase | null>(
    (a, p) => (p.grams > (a?.grams ?? 0) ? p : a),
    null
  );
  if (whale)
    trophies.push({
      id: "whale-buy",
      emoji: "🐋",
      title: "Whale Buy",
      desc: "biggest single re-up",
      winner: whale.member,
      value: `${grams(whale.grams)} in one go`,
    });

  // Consumption-only net, NOT b.net: sale cash is the group's money passing
  // through the seller's hands, not them paying for or freeloading on smoke.
  const saint = top(
    balances.map((b) => ({ member: b.member, score: round2(b.bought - b.smokedShare) }))
  );
  if (saint)
    trophies.push({
      id: "the-saint",
      emoji: "😇",
      title: "The Saint",
      desc: "pays way more than they puff",
      winner: saint.member,
      value: `${inr(saint.score)} in credit`,
    });

  const shark = top(
    balances.map((b) => ({ member: b.member, score: round2(b.smokedShare - b.bought) }))
  );
  if (shark)
    trophies.push({
      id: "the-shark",
      emoji: "🦈",
      title: "The Shark",
      desc: "smokes now, pays… eventually",
      winner: shark.member,
      value: `${inr(shark.score)} behind`,
    });

  const plug = top(
    members.map((member) => ({
      member,
      score: sales
        .filter((s) => s.sold_by === member.id)
        .reduce((sum, s) => sum + saleProfit(s), 0),
    }))
  );
  if (plug)
    trophies.push({
      id: "the-plug",
      emoji: "💰",
      title: "The Plug",
      desc: "turns green into greener",
      winner: plug.member,
      value: `${inr(round2(plug.score))} flipped`,
    });

  return trophies;
}
