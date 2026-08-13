"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PIN_COOKIE, sha256Hex } from "./auth";
import { avgCostPerGram, round2, stashGrams } from "./calc";
import { getPurchases, getSales, getSeshById, getSeshes } from "./queries";
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
  const emoji = String(formData.get("emoji") ?? "").trim() || "🥦";
  if (!name) return { error: "A stoner needs a name" };
  if (name.length > 30) return { error: "That name is way too long, bro" };

  const { error } = await getSupabase().from("members").insert({ name, emoji });
  if (error) {
    return {
      error: error.code === "23505" ? `${name} is already in the circle 👀` : error.message,
    };
  }
  updateTag("jar");
  return null;
}

export async function addPurchase(
  jarId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const member_id = String(formData.get("member_id") ?? "");
  const grams = Number(formData.get("grams"));
  const total_cost = Number(formData.get("total_cost"));
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!member_id) return { error: "Who bought it? Pick a member" };
  if (!Number.isFinite(grams) || grams <= 0) return { error: "Grams must be more than 0" };
  if (!Number.isFinite(total_cost) || total_cost <= 0) return { error: "Cost must be more than ₹0" };

  const { error } = await getSupabase()
    .from("purchases")
    .insert({ jar_id: jarId, member_id, grams: round2(grams), total_cost: round2(total_cost), note });
  if (error) return { error: error.message };
  updateTag("jar");
  return null;
}

export async function deletePurchase(id: string): Promise<void> {
  // The row is authoritative for which jar it belongs to — never the client.
  const purchases = await getPurchases();
  const target = purchases.find((p) => p.id === id);
  if (!target) return;
  const jarPurchases = purchases.filter((p) => p.jar_id === target.jar_id);
  const [seshes, sales] = await Promise.all([
    getSeshes(target.jar_id),
    getSales(target.jar_id),
  ]);
  // Removing a buy can't leave the jar owing grams it already smoked or sold.
  const stashAfter = stashGrams(jarPurchases, seshes, sales) - target.grams;
  if (stashAfter < 0) return;

  await getSupabase().from("purchases").delete().eq("id", id);
  updateTag("jar");
}

export async function createSesh(
  jarId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const end_grams = Number(formData.get("end_grams"));
  const participantIds = [
    ...new Set(formData.getAll("participants").map(String).filter(Boolean)),
  ];
  const note = String(formData.get("note") ?? "").trim() || null;

  if (participantIds.length === 0) return { error: "A sesh with nobody in it? Sus 🤨" };
  if (!Number.isFinite(end_grams) || end_grams < 0)
    return { error: "End weight can't be negative" };

  // Continuity invariant: the start weight is ALWAYS the current stash
  // (last sesh's end + purchases since, minus anything flipped) — never
  // taken from the client.
  const [purchases, seshes, sales] = await Promise.all([
    getPurchases(jarId),
    getSeshes(jarId),
    getSales(jarId),
  ]);
  const start_grams = stashGrams(purchases, seshes, sales);
  const cost_per_gram = avgCostPerGram(purchases);

  if (start_grams <= 0 || cost_per_gram <= 0)
    return { error: "Jar's empty 🥲 — hit the treasury first" };
  if (end_grams >= start_grams)
    return { error: `You just stared at it? 👀 End weight must be under ${start_grams}g` };

  const supabase = getSupabase();
  const { data: sesh, error } = await supabase
    .from("seshes")
    .insert({
      jar_id: jarId,
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
  updateTag("jar");
  redirect(`/jar/${jarId}?celebrate=1`);
}

export async function updateSesh(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Gate first: edits rewrite history, so they need the admin code. The check
  // lives server-side only — the code never reaches the client bundle.
  const code = String(formData.get("admin_code") ?? "").trim();
  const expected = process.env.G_TRACKER_ADMIN_CODE || "2000";
  if (code !== expected) return { error: "Wrong admin code 🚔" };

  const end_grams = Number(formData.get("end_grams"));
  const participantIds = [
    ...new Set(formData.getAll("participants").map(String).filter(Boolean)),
  ];
  const note = String(formData.get("note") ?? "").trim() || null;

  if (participantIds.length === 0) return { error: "A sesh with nobody in it? Sus 🤨" };
  if (!Number.isFinite(end_grams) || end_grams < 0)
    return { error: "End weight can't be negative" };

  // The row is authoritative for which jar it belongs to — never the client.
  const target = await getSeshById(id);
  if (!target) return { error: "That sesh isn't in the books anymore 👻" };
  const [purchases, seshes, sales] = await Promise.all([
    getPurchases(target.jar_id),
    getSeshes(target.jar_id),
    getSales(target.jar_id),
  ]);

  if (end_grams >= target.start_grams)
    return { error: `You just stared at it? 👀 End weight must be under ${target.start_grams}g` };

  // Smoking MORE than originally logged pulls extra grams out of the jar —
  // refuse if the jar has since smoked/sold them. Un-smoking (raising the end
  // weight) only returns grams, so it never needs a guard. Epsilon because
  // these are round2 doubles.
  const newSmoked = round2(target.start_grams - round2(end_grams));
  const delta = newSmoked - target.grams_smoked;
  if (delta > 0 && delta - stashGrams(purchases, seshes, sales) > 0.001)
    return {
      error: `Can't add ${round2(delta)}g of smoke — the jar doesn't have it anymore 🫙`,
    };

  const supabase = getSupabase();
  const { error } = await supabase
    .from("seshes")
    .update({ end_grams: round2(end_grams), note })
    .eq("id", id);
  if (error) return { error: error.message };

  // No transactions — diff the participants instead of delete-all-then-insert,
  // and add before removing, so a mid-way failure leaves a harmless superset
  // rather than a zero-participant sesh.
  const oldIds = new Set(target.participants.map((m) => m.id));
  const toAdd = participantIds.filter((mid) => !oldIds.has(mid));
  const toRemove = [...oldIds].filter((mid) => !participantIds.includes(mid));
  if (toAdd.length > 0) {
    const { error: aErr } = await supabase
      .from("sesh_participants")
      .insert(toAdd.map((member_id) => ({ sesh_id: id, member_id })));
    if (aErr) return { error: aErr.message };
  }
  if (toRemove.length > 0) {
    const { error: rErr } = await supabase
      .from("sesh_participants")
      .delete()
      .eq("sesh_id", id)
      .in("member_id", toRemove);
    if (rErr) return { error: rErr.message };
  }

  updateTag("jar");
  redirect(`/jar/${target.jar_id}/sesh`);
}

export async function deleteSesh(id: string): Promise<void> {
  // Participants cascade via FK; grams simply flow back into the stash.
  await getSupabase().from("seshes").delete().eq("id", id);
  updateTag("jar");
}

export async function createSale(
  jarId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const sold_by = String(formData.get("sold_by") ?? "");
  const gramsSold = Number(formData.get("grams"));
  const total_price = Number(formData.get("total_price"));
  // Dedupe: a duplicate id would trip the composite PK and take the whole
  // sale down with the compensating delete below.
  const beneficiaryIds = [
    ...new Set(formData.getAll("beneficiaries").map(String).filter(Boolean)),
  ];
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!sold_by) return { error: "Who moved it? Somebody's holding the cash 💵" };
  if (beneficiaryIds.length === 0) return { error: "Split it with who? Pick the crew 🤝" };
  if (!Number.isFinite(gramsSold) || gramsSold <= 0) return { error: "Grams must be more than 0" };
  if (!Number.isFinite(total_price) || total_price <= 0)
    return { error: "Price must be more than ₹0" };

  // Same rule as createSesh: the stash and the rate come from the server, never
  // the client. The rate is snapshotted so the profit is immutable after today.
  const [purchases, seshes, sales] = await Promise.all([
    getPurchases(jarId),
    getSeshes(jarId),
    getSales(jarId),
  ]);
  const stash = stashGrams(purchases, seshes, sales);
  const cost_per_gram = avgCostPerGram(purchases);
  const grams = round2(gramsSold);

  if (stash <= 0 || cost_per_gram <= 0) return { error: "Jar's empty 🥲 — nothing to flip" };
  // Epsilon, not `grams > stash`: both are round2 doubles, and selling the jar
  // dry is a legit move that exact comparison would reject half the time.
  if (grams - stash > 0.001)
    return { error: `Can't sell ${grams}g — only ${stash}g in the jar 🫙` };

  // House rule: never move it below what it cost the jar. Break-even is fine,
  // a loss is not. Compare against the exact values being inserted, with a
  // sub-paisa tolerance so rounding can't reject a legit break-even sale.
  const rounded_price = round2(total_price);
  const basis = round2(grams * round2(cost_per_gram));
  if (rounded_price < basis - 0.005)
    return {
      error: `Nah — ${grams}g cost the jar ₹${basis}. No selling at a loss, price it at ₹${basis} or up 📈`,
    };

  const supabase = getSupabase();
  const { data: sale, error } = await supabase
    .from("sales")
    .insert({
      jar_id: jarId,
      sold_by,
      grams,
      total_price: rounded_price,
      cost_per_gram: round2(cost_per_gram),
      note,
    })
    .select("id")
    .single();
  if (error || !sale) return { error: error?.message ?? "Failed to save the flip" };

  const { error: bErr } = await supabase
    .from("sale_beneficiaries")
    .insert(beneficiaryIds.map((member_id) => ({ sale_id: sale.id, member_id })));
  if (bErr) {
    // No transactions here — compensate by removing the orphaned parent.
    await supabase.from("sales").delete().eq("id", sale.id);
    return { error: bErr.message };
  }
  updateTag("jar");
  return null;
}

export async function createJar(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim() || "🫙";
  if (!name) return { error: "A jar needs a name" };
  if (name.length > 30) return { error: "That name is way too long, bro" };

  const { data, error } = await getSupabase()
    .from("jars")
    .insert({ name, emoji })
    .select("id")
    .single();
  if (error || !data) {
    return {
      error:
        error?.code === "23505"
          ? `There's already a jar called ${name} 👀`
          : (error?.message ?? "Failed to create the jar"),
    };
  }
  updateTag("jar");
  redirect(`/jar/${data.id}`);
}

export async function deleteJar(id: string, code: string): Promise<{ error?: string } | void> {
  // Nuking a jar takes its whole ledger with it (FK cascade) — admin only.
  const expected = process.env.G_TRACKER_ADMIN_CODE || "2000";
  if (code.trim() !== expected) return { error: "Wrong admin code 🚔" };

  const { error } = await getSupabase().from("jars").delete().eq("id", id);
  if (error) return { error: error.message };
  updateTag("jar");
}

export async function deleteSale(id: string): Promise<void> {
  // Beneficiaries cascade via FK; the grams flow back into the stash, so this
  // can never drive it negative — no guard needed.
  await getSupabase().from("sales").delete().eq("id", id);
  updateTag("jar");
}
