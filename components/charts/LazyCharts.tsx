"use client";

import { ReactNode, Suspense } from "react";

// Loading fallback
const ChartLoading = () => (
  <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg animate-pulse">
    <div className="text-sm text-gray-500">Loading chart...</div>
  </div>
);

// Simple chart wrapper with lazy loading
export const LazyChart = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<ChartLoading />}>{children}</Suspense>
);
