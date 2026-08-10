import { getSupabase } from "./supabase";
import type { Member, Purchase, Sesh } from "./types";

// Supabase returns Postgres `numeric` columns as strings — coerce once here
// so every consumer works in plain numbers.

/* eslint-disable @typescript-eslint/no-explicit-any */

function toMember(row: any): Member {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    created_at: row.created_at,
  };
}

function toPurchase(row: any): Purchase {
  return {
    id: row.id,
    member_id: row.member_id,
    grams: Number(row.grams),
    total_cost: Number(row.total_cost),
    note: row.note,
    created_at: row.created_at,
    member: toMember(row.member),
  };
}

function toSesh(row: any): Sesh {
  return {
    id: row.id,
    start_grams: Number(row.start_grams),
    end_grams: Number(row.end_grams),
    grams_smoked: Number(row.grams_smoked),
    cost_per_gram: Number(row.cost_per_gram),
    note: row.note,
    created_at: row.created_at,
    participants: (row.sesh_participants ?? []).map((p: any) => toMember(p.member)),
  };
}

export async function getMembers(): Promise<Member[]> {
  const { data, error } = await getSupabase()
    .from("members")
    .select("*")
    .order("created_at");
  if (error) throw new Error(`getMembers: ${error.message}`);
  return (data ?? []).map(toMember);
}

export async function getPurchases(): Promise<Purchase[]> {
  const { data, error } = await getSupabase()
    .from("purchases")
    .select("*, member:members(*)")
    .order("created_at");
  if (error) throw new Error(`getPurchases: ${error.message}`);
  return (data ?? []).map(toPurchase);
}

export async function getSeshes(): Promise<Sesh[]> {
  const { data, error } = await getSupabase()
    .from("seshes")
    .select("*, sesh_participants(member:members(*))")
    .order("created_at");
  if (error) throw new Error(`getSeshes: ${error.message}`);
  return (data ?? []).map(toSesh);
}

/** One round trip for everything — the dataset is tiny (a friend group's jar). */
export async function getEverything() {
  const [members, purchases, seshes] = await Promise.all([
    getMembers(),
    getPurchases(),
    getSeshes(),
  ]);
  return { members, purchases, seshes };
}
