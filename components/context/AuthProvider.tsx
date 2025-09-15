"use client";

import { createClient } from "@/app/utils/supabase/client";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const supabase = createClient();

interface AppUser {
  id: string;
  name: string;
  role: string;
  email_verified: boolean;
  permissions: string[];
  join_date: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  refreshUserData: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  signOut: async () => {},
  isAdmin: false,
  refreshUserData: async () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(
    async (userId: string): Promise<AppUser> => {
      try {
        // First try to get user from database
        const userResponse = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (userResponse.data && !userResponse.error) {
          // User exists in database, return it
          return {
            id: userResponse.data.id,
            name: userResponse.data.name,
            role: userResponse.data.role,
            email_verified: true, // Always true for now
            permissions: userResponse.data.permissions || ["dashboard:read"],
            join_date: userResponse.data.join_date,
            created_at: userResponse.data.created_at,
            updated_at: userResponse.data.updated_at,
          };
        }

        // User doesn't exist, create fallback without database insertion
        console.log("User not found in database, using fallback profile");
        const sessionUser = await supabase.auth.getUser();

        const fallbackUser: AppUser = {
          id: userId,
          name:
            sessionUser.data.user?.user_metadata?.full_name ||
            sessionUser.data.user?.user_metadata?.name ||
            sessionUser.data.user?.email?.split("@")[0] ||
            "User",
          role: "user",
          email_verified: true,
          permissions: ["dashboard:read"],
          join_date:
            sessionUser.data.user?.created_at || new Date().toISOString(),
          created_at:
            sessionUser.data.user?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return fallbackUser;
      } catch (error) {
        console.log("Error fetching user profile:", error);

        // Return minimal fallback user
        const fallbackUser: AppUser = {
          id: userId,
          name: "User",
          role: "user",
          email_verified: true,
          permissions: ["dashboard:read"],
          join_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return fallbackUser;
      }
    },
    []
  );

  // Function to sync email verification status with database
  const syncEmailVerificationStatus = useCallback(
    async (userId: string, isVerified: boolean) => {
      try {
        await supabase
          .from("users")
          .update({ email_verified: isVerified })
          .eq("id", userId);
        console.log("Email verification status synced with database");
      } catch (error) {
        console.log("Could not sync email verification status:", error);
      }
    },
    []
  );

  // Force refresh user data
  const refreshUserData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const userProfile = await fetchUserProfile(user.id);
      setAppUser(userProfile);

      // Also sync verification status
      const isVerified = !!user.email_confirmed_at;
      await syncEmailVerificationStatus(user.id, isVerified);
    }
  }, [fetchUserProfile, syncEmailVerificationStatus]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted && session?.user) {
          setUser(session.user);
          // Optimistically set app user with auth data immediately
          const quickUser: AppUser = {
            id: session.user.id,
            name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split("@")[0] ||
              "User",
            role: "user",
            email_verified: !!session.user.email_confirmed_at,
            permissions: ["dashboard:read"],
            join_date: session.user.created_at || new Date().toISOString(),
            created_at: session.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setAppUser(quickUser);

          // Fetch complete profile in background
          fetchUserProfile(session.user.id)
            .then((userProfile) => {
              if (mounted) {
                setAppUser(userProfile);
              }
            })
            .catch((error) => {
              console.error("Background profile fetch failed:", error);
            });
        } else if (mounted) {
          setUser(null);
          setAppUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setUser(null);
          setAppUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn("Auth initialization timeout, setting loading to false");
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        console.log("Auth state change:", event, !!session?.user);

        if (session?.user) {
          setUser(session.user);
          // For most auth events, just update the existing user data
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            // Quick update with session data
            const quickUser: AppUser = {
              id: session.user.id,
              name:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.email?.split("@")[0] ||
                "User",
              role: "user",
              email_verified: !!session.user.email_confirmed_at,
              permissions: ["dashboard:read"],
              join_date: session.user.created_at || new Date().toISOString(),
              created_at: session.user.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setAppUser(quickUser);

            // Fetch complete profile to update with database info
            fetchUserProfile(session.user.id)
              .then((userProfile) => {
                if (mounted) setAppUser(userProfile);
              })
              .catch(console.error);
          }
        } else {
          setUser(null);
          setAppUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signOut = useCallback(async () => {
    try {
      console.log("Starting signOut process...");

      // Clear local state first
      setUser(null);
      setAppUser(null);
      console.log("Local state cleared");

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Supabase signOut error:", error);
        throw error;
      }

      console.log("Successfully signed out from Supabase");

      // Force reload to clear any cached data
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if there's an error, clear local state and redirect
      setUser(null);
      setAppUser(null);

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, []);
  const isAdmin = appUser?.role === "admin";

  const contextValue = useMemo(
    () => ({
      user,
      appUser,
      signOut,
      isAdmin,
      refreshUserData,
      isLoading,
    }),
    [user, appUser, signOut, isAdmin, refreshUserData, isLoading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
