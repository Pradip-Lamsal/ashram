import { createBrowserClient } from "@supabase/ssr";

// Cache the client instance to avoid recreation
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        db: {
          schema: "public",
        },
        global: {
          headers: {
            "x-client-info": "ashram-management",
          },
        },
      }
    );
  }

  return supabaseClient;
}
