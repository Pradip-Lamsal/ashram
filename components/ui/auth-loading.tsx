"use client";

import { Heart } from "lucide-react";

export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center">
          <Heart className="h-12 w-12 animate-pulse text-orange-500" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Ashram Management
        </h2>
        <p className="mb-4 text-gray-600">Loading your session...</p>
        <div className="h-2 w-48 mx-auto bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 rounded-full animate-pulse"></div>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Please wait while we prepare your experience
        </p>
      </div>
    </div>
  );
}
