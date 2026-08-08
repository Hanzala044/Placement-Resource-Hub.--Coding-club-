import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in .env.local (copy .env.example to get started)."
    );
  }

  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

/**
 * Server-only Supabase client authenticated with the service-role key.
 * Import this from Route Handlers and Server Components only — the
 * `server-only` package makes it a build error to pull it into client code.
 *
 * Wrapped in a Proxy so a missing .env.local doesn't crash module import;
 * the clear error above only fires once a request actually touches the DB.
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const instance = getClient();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
