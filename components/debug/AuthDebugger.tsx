"use client";

import { createClient } from "@/app/utils/supabase/client";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient();

interface DebugInfo {
  timestamp: string;
  session?: {
    exists: boolean;
    user?: {
      id: string;
      email?: string;
      emailConfirmed?: string | null;
      role?: string;
    } | null;
    error?: string;
  };
  user?: {
    exists: boolean;
    userData?: {
      id: string;
      email?: string;
      emailConfirmed?: string | null;
    } | null;
    error?: string;
  };
  usersTable?: {
    accessible: boolean;
    data?: unknown;
    error?: string;
  };
  environment?: {
    hasUrl: boolean;
    hasAnonKey: boolean;
    urlValue?: string;
  };
  error?: string;
}

export default function AuthDebugger() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    timestamp: new Date().toISOString(),
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get session
        const { data: session, error: sessionError } =
          await supabase.auth.getSession();

        // Get user
        const { data: user, error: userError } = await supabase.auth.getUser();

        // Try to access users table
        let usersTableAccess = null;
        let usersTableError = null;
        try {
          const { data, error } = await supabase
            .from("users")
            .select("id, name, role")
            .limit(1);
          usersTableAccess = data;
          usersTableError = error;
        } catch (err) {
          usersTableError = err;
        }

        // Check environment variables
        const envCheck = {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
        };

        setDebugInfo({
          timestamp: new Date().toISOString(),
          session: {
            exists: !!session?.session,
            user: session?.session?.user
              ? {
                  id: session.session.user.id,
                  email: session.session.user.email,
                  emailConfirmed: session.session.user.email_confirmed_at,
                  role: session.session.user.role,
                }
              : null,
            error: sessionError?.message,
          },
          user: {
            exists: !!user?.user,
            userData: user?.user
              ? {
                  id: user.user.id,
                  email: user.user.email,
                  emailConfirmed: user.user.email_confirmed_at,
                }
              : null,
            error: userError?.message,
          },
          usersTable: {
            accessible: !usersTableError,
            data: usersTableAccess,
            error: usersTableError?.message || String(usersTableError),
          },
          environment: envCheck,
        });
      } catch (error) {
        setDebugInfo({
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log("Auth state changed:", event, session?.user?.email);
        checkAuth();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm z-50 hover:bg-red-600"
        style={{ zIndex: 9999 }}
      >
        🐛 Auth Debug
      </button>

      {/* Debug panel */}
      {isVisible && (
        <div
          className="fixed bottom-16 right-4 bg-black text-green-400 p-4 rounded-lg max-w-md max-h-96 overflow-auto text-xs font-mono z-50"
          style={{ zIndex: 9999 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-bold">Auth Debug Info</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}
