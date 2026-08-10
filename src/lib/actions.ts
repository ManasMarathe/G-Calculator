"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PIN_COOKIE, sha256Hex } from "./auth";
import { avgCostPerGram, round2, stashGrams } from "./calc";
import { getPurchases, getSeshes } from "./queries";
import { getSupabase } from "./supabase";

export type ActionState = { error?: string } | null;

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const pin = String(formData.get("pin") ?? "").trim();
  const expected = process.env.G_TRACKER_PIN;
  if (!expected) return { error: "G_TRACKER_PIN is not configured on the server 🤷" };
  if (pin !== expected) return { error: "Nice try, narc 🚔" };

  const jar = await cookies();
  jar.set(PIN_COOKIE, await sha256Hex(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
    path: "/",
  });
  redirect("/");
}

export async function addMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim() || "🌿";
  if (!name) return { error: "A stoner needs a name" };
  if (name.length > 30) return { error: "That name is way too long, bro" };

  const { error } = await getSupabase().from("members").insert({ name, emoji });
  if (error) {
    return {
      error: error.code === "23505" ? `${name} is already in the circle 👀` : error.message,
    };
  }
  revalidatePath("/", "layout");
  return null;
}

export async function addPurchase(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const member_id = String(formData.get("member_id") ?? "");
  const grams = Number(formData.get("grams"));
  const total_cost = Number(formData.get("total_cost"));
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!member_id) return { error: "Who bought it? Pick a member" };
  if (!Number.isFinite(grams) || grams <= 0) return { error: "Grams must be more than 0" };
  if (!Number.isFinite(total_cost) || total_cost <= 0) return { error: "Cost must be more than ₹0" };

  const { error } = await getSupabase()
    .from("purchases")
    .insert({ member_id, grams: round2(grams), total_cost: round2(total_cost), note });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return null;
}

export async function deletePurchase(id: string): Promise<void> {
  const [purchases, seshes] = await Promise.all([getPurchases(), getSeshes()]);
  const target = purchases.find((p) => p.id === id);
  if (!target) return;
  // Removing a buy can't leave the jar owing grams it already smoked.
  const stashAfter = stashGrams(purchases, seshes) - target.grams;
  if (stashAfter < 0) return;

  await getSupabase().from("purchases").delete().eq("id", id);
  revalidatePath("/", "layout");
}

export async function createSesh(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const end_grams = Number(formData.get("end_grams"));
  const participantIds = formData.getAll("participants").map(String).filter(Boolean);
  const note = String(formData.get("note") ?? "").trim() || null;

  if (participantIds.length === 0) return { error: "A sesh with nobody in it? Sus 🤨" };
  if (!Number.isFinite(end_grams) || end_grams < 0)
    return { error: "End weight can't be negative" };

  // Continuity invariant: the start weight is ALWAYS the current stash
  // (last sesh's end + purchases since) — never taken from the client.
  const [purchases, seshes] = await Promise.all([getPurchases(), getSeshes()]);
  const start_grams = stashGrams(purchases, seshes);
  const cost_per_gram = avgCostPerGram(purchases);

  if (start_grams <= 0 || cost_per_gram <= 0)
    return { error: "Jar's empty 🥲 — hit the treasury first" };
  if (end_grams >= start_grams)
    return { error: `You just stared at it? 👀 End weight must be under ${start_grams}g` };

  const supabase = getSupabase();
  const { data: sesh, error } = await supabase
    .from("seshes")
    .insert({
      start_grams,
      end_grams: round2(end_grams),
      cost_per_gram: round2(cost_per_gram),
      note,
    })
    .select("id")
    .single();
  if (error || !sesh) return { error: error?.message ?? "Failed to save sesh" };

  const { error: pErr } = await supabase
    .from("sesh_participants")
    .insert(participantIds.map((member_id) => ({ sesh_id: sesh.id, member_id })));
  if (pErr) {
    await supabase.from("seshes").delete().eq("id", sesh.id);
    return { error: pErr.message };
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function deleteSesh(id: string): Promise<void> {
  // Participants cascade via FK; grams simply flow back into the stash.
  await getSupabase().from("seshes").delete().eq("id", id);
  revalidatePath("/", "layout");
}
