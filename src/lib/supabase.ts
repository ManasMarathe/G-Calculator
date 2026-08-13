import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service-role key (RLS is enabled with no
// policies, so this key is the only way in). Never import from a client
// component.
let client: SupabaseClient | undefined;

export function getSupabase() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
