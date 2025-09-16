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
          // Use localStorage in development to avoid cookie domain issues
          storage:
            typeof window !== "undefined" ? window.localStorage : undefined,
          storageKey: "supabase.auth.token",
        },
        db: {
          schema: "public",
        },
        global: {
          headers: {
            "x-client-info": "ashram-management",
          },
        },
        // Simple cookie options to avoid domain conflicts
        cookieOptions: {
          name: "supabase-auth-token",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        },
      }
    );
  }

  return supabaseClient;
}
