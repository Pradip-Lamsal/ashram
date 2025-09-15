"use client";

import { useAuth } from "@/components/context/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect when not loading and we have a definitive auth state
    if (!isLoading && !redirecting) {
      setRedirecting(true);

      if (user) {
        console.log("User authenticated, redirecting to dashboard");
        router.push("/dashboard");
      } else {
        console.log("User not authenticated, redirecting to login");
        router.push("/login");
      }
    }
  }, [user, isLoading, router, redirecting]);

  // Show loading state
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {isLoading ? "Checking authentication..." : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}
