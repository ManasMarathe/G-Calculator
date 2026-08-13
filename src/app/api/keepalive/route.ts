import { getSupabase } from "@/lib/supabase";

// Hit daily by the Vercel cron (see vercel.json) so the Supabase free-tier
// project never idles long enough to auto-pause.
export async function GET() {
  const { error } = await getSupabase().from("members").select("id").limit(1);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
