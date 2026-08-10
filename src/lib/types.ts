export type Member = {
  id: string;
  name: string;
  emoji: string;
  created_at: string;
};

export type Purchase = {
  id: string;
  member_id: string;
  grams: number;
  total_cost: number;
  note: string | null;
  created_at: string;
  member: Member;
};

export type Sesh = {
  id: string;
  start_grams: number;
  end_grams: number;
  grams_smoked: number;
  cost_per_gram: number;
  note: string | null;
  created_at: string;
  participants: Member[];
};

export type Balance = {
  member: Member;
  bought: number; // ₹ credited from purchases
  smokedShare: number; // ₹ debited from sesh shares
  smokedGrams: number; // attributed grams (equal split per sesh)
  net: number; // bought − smokedShare
  settle: number; // net minus share of remaining stash value (sums to ~0)
};

export type Transfer = {
  from: Member;
  to: Member;
  amount: number;
};

export type ActivityItem =
  | { kind: "purchase"; at: string; purchase: Purchase; stashAfter: number }
  | { kind: "sesh"; at: string; sesh: Sesh; stashAfter: number };
