import { createClient } from "@supabase/supabase-js";

// Server-only client using the service-role key (RLS is enabled with no
// policies, so this key is the only way in). Never import from a client
// component.
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
