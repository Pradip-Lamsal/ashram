"use client";

import {
  ResourcePreloader,
  usePerformanceMonitor,
} from "@/hooks/usePerformance";
import { ReactNode } from "react";

interface PerformanceProviderProps {
  children: ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  usePerformanceMonitor();

  return (
    <>
      <ResourcePreloader />
      {children}
    </>
  );
}
