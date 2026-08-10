import type { Balance, Member, Purchase, Sesh, Transfer, ActivityItem } from "./types";

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Lifetime weighted average: total ₹ spent / total grams bought. 0 if no purchases. */
export function avgCostPerGram(purchases: Pick<Purchase, "grams" | "total_cost">[]): number {
  const grams = purchases.reduce((s, p) => s + p.grams, 0);
  if (grams <= 0) return 0;
  const cost = purchases.reduce((s, p) => s + p.total_cost, 0);
  return cost / grams;
}

/** Grams left in the jar = everything bought − everything smoked. */
export function stashGrams(
  purchases: Pick<Purchase, "grams">[],
  seshes: Pick<Sesh, "grams_smoked">[]
): number {
  const bought = purchases.reduce((s, p) => s + p.grams, 0);
  const smoked = seshes.reduce((s, x) => s + x.grams_smoked, 0);
  return round2(bought - smoked);
}

export function seshCost(sesh: Pick<Sesh, "grams_smoked" | "cost_per_gram">): number {
  return sesh.grams_smoked * sesh.cost_per_gram;
}

export function seshCostPerHead(sesh: Pick<Sesh, "grams_smoked" | "cost_per_gram" | "participants">): number {
  const n = sesh.participants.length;
  return n > 0 ? seshCost(sesh) / n : 0;
}

/**
 * Per-member ledger, consumption-based: you're credited for what you bought
 * and debited only for what you smoked (at each sesh's snapshotted rate).
 * Nets don't sum to zero — the surplus is the weed still in the jar, which
 * stays as the buyers' credit until it gets smoked.
 */
export function computeBalances(
  members: Member[],
  purchases: Purchase[],
  seshes: Sesh[]
): Balance[] {
  return members.map((member) => {
    const bought = purchases
      .filter((p) => p.member_id === member.id)
      .reduce((s, p) => s + p.total_cost, 0);
    let smokedShare = 0;
    let smokedGrams = 0;
    for (const sesh of seshes) {
      if (sesh.participants.some((m) => m.id === member.id)) {
        const n = sesh.participants.length;
        smokedShare += seshCost(sesh) / n;
        smokedGrams += sesh.grams_smoked / n;
      }
    }
    return {
      member,
      bought: round2(bought),
      smokedShare: round2(smokedShare),
      smokedGrams: round2(smokedGrams),
      net: round2(bought - smokedShare),
    };
  });
}

/**
 * Greedy debt simplification: largest creditor vs largest debtor. Stops when
 * every debtor is settled — creditors' unmatched remainder is jar credit.
 */
export function settleDebts(balances: Balance[]): Transfer[] {
  const creditors = balances
    .filter((b) => b.net > 0.01)
    .map((b) => ({ member: b.member, amount: b.net }))
    .sort((a, b) => b.amount - a.amount);
  const debtors = balances
    .filter((b) => b.net < -0.01)
    .map((b) => ({ member: b.member, amount: -b.net }))
    .sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];
  while (creditors.length > 0 && debtors.length > 0) {
    const pay = Math.min(creditors[0].amount, debtors[0].amount);
    transfers.push({ from: debtors[0].member, to: creditors[0].member, amount: round2(pay) });
    creditors[0].amount -= pay;
    debtors[0].amount -= pay;
    if (creditors[0].amount < 0.01) creditors.shift();
    if (debtors[0].amount < 0.01) debtors.shift();
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);
  }
  return transfers;
}

/** All transactions oldest→newest with the stash level after each one. */
export function buildActivity(purchases: Purchase[], seshes: Sesh[]): ActivityItem[] {
  type Bare =
    | { kind: "purchase"; at: string; purchase: Purchase }
    | { kind: "sesh"; at: string; sesh: Sesh };
  const items: Bare[] = [
    ...purchases.map((p): Bare => ({ kind: "purchase", at: p.created_at, purchase: p })),
    ...seshes.map((s): Bare => ({ kind: "sesh", at: s.created_at, sesh: s })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  let stash = 0;
  return items.map((item): ActivityItem => {
    stash += item.kind === "purchase" ? item.purchase.grams : -item.sesh.grams_smoked;
    return { ...item, stashAfter: round2(stash) };
  });
}
