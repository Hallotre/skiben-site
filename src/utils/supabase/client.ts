
import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

let client: SupabaseClient | undefined;

export const createClient = () => {
  if (client) return client;

  client = createBrowserClient(
    supabaseUrl,
    supabaseKey,
  ) as unknown as SupabaseClient;

  return client;
};
