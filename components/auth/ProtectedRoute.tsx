"use client";

import { useAuth } from "@/components/context/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireApproval?: boolean;
  requireAdmin?: boolean;
  allowPending?: boolean;
}

export default function ProtectedRoute({
  children,
  requireApproval = true,
  requireAdmin = false,
  allowPending = false,
}: ProtectedRouteProps) {
  const { user, appUser, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      // Still loading auth state
      if (isLoading) {
        return;
      }

      // Not authenticated
      if (!user) {
        router.push("/login");
        return;
      }

      // No app user data yet
      if (!appUser) {
        return;
      }

      // Require admin access
      if (requireAdmin && !isAdmin) {
        router.push("/dashboard");
        return;
      }

      // Check user status for approval requirement
      if (requireApproval && !allowPending) {
        if (appUser.status === "pending") {
          router.push("/approval-pending");
          return;
        }

        if (appUser.status === "rejected") {
          router.push("/approval-pending");
          return;
        }

        if (appUser.status !== "approved") {
          router.push("/approval-pending");
          return;
        }
      }

      // All checks passed
      setIsChecking(false);
    };

    checkAccess();
  }, [
    user,
    appUser,
    isLoading,
    isAdmin,
    requireApproval,
    requireAdmin,
    allowPending,
    router,
  ]);

  // Show loading state while checking
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="w-8 h-8 border-b-2 border-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
}
