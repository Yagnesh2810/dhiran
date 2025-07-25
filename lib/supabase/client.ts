import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { env } from "../env"

let client: SupabaseClient | undefined

export function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  client = createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  return client
}

// Example usage:
// import { getSupabaseBrowserClient } from '@/lib/supabase/client';
// const supabase = getSupabaseBrowserClient();
// const { data, error } = await supabase.from('your_table').select('*');
