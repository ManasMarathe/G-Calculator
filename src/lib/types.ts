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

export type Sale = {
  id: string;
  sold_by: string;
  grams: number;
  total_price: number;
  cost_per_gram: number; // snapshot of the weighted avg at sale time
  note: string | null;
  created_at: string;
  seller: Member;
  beneficiaries: Member[];
};

export type Balance = {
  member: Member;
  bought: number; // ₹ credited from purchases
  earned: number; // ₹ credited from equal profit shares (flips are cost-or-above, so ≥ 0)
  smokedShare: number; // ₹ debited from sesh shares
  smokedGrams: number; // attributed grams (equal split per sesh)
  collected: number; // ₹ debited — sale cash they're personally holding
  soldGrams: number; // grams they moved as the seller
  net: number; // bought + earned − smokedShare − collected
};

export type Transfer = {
  from: Member;
  to: Member;
  amount: number;
};

export type ActivityItem =
  | { kind: "purchase"; at: string; purchase: Purchase; stashAfter: number }
  | { kind: "sesh"; at: string; sesh: Sesh; stashAfter: number }
  | { kind: "sale"; at: string; sale: Sale; stashAfter: number };
