"use client";

import { useEffect } from "react";

export function usePerformanceMonitor() {
  useEffect(() => {
    // Performance observer for measuring page load times
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            const navigationEntry = entry as PerformanceNavigationTiming;
            const loadTime =
              navigationEntry.loadEventEnd - navigationEntry.fetchStart;

            // Log performance metrics
            console.log(`Page Load Time: ${Math.round(loadTime)}ms`);

            // Goal: Keep under 500ms
            if (loadTime > 500) {
              console.warn(
                `⚠️ Page load time (${Math.round(
                  loadTime
                )}ms) exceeds 500ms target`
              );
            } else {
              console.log(
                `✅ Page load time (${Math.round(
                  loadTime
                )}ms) is under 500ms target`
              );
            }
          }

          if (entry.entryType === "largest-contentful-paint") {
            const lcp = Math.round(entry.startTime);
            console.log(`Largest Contentful Paint: ${lcp}ms`);

            if (lcp > 400) {
              console.warn(`⚠️ LCP (${lcp}ms) could be improved`);
            }
          }

          if (entry.entryType === "first-input") {
            const fidEntry = entry as PerformanceEventTiming;
            const fid = Math.round(
              fidEntry.processingStart - fidEntry.startTime
            );
            console.log(`First Input Delay: ${fid}ms`);
          }
        }
      });

      // Observe navigation timing
      observer.observe({
        entryTypes: ["navigation", "largest-contentful-paint", "first-input"],
      });

      // Also measure initial load
      window.addEventListener("load", () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType(
            "navigation"
          )[0] as PerformanceNavigationTiming;
          const loadTime = perfData.loadEventEnd - perfData.fetchStart;

          // Store performance data
          if (typeof window !== "undefined") {
            (window as Window & { __ASHRAM_PERF__?: object }).__ASHRAM_PERF__ =
              {
                loadTime: Math.round(loadTime),
                domContentLoaded: Math.round(
                  perfData.domContentLoadedEventEnd - perfData.fetchStart
                ),
                firstPaint: Math.round(
                  performance.getEntriesByType("paint")[0]?.startTime || 0
                ),
                timestamp: Date.now(),
              };
          }
        }, 0);
      });

      return () => observer.disconnect();
    }
  }, []);
}

export function ResourcePreloader() {
  useEffect(() => {
    // Preload critical resources
    const preloadResources = [
      { href: "/Login-image.jpg", as: "image" },
      { href: "/register-image.jpg", as: "image" },
    ];

    preloadResources.forEach(({ href, as }) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = href;
      link.as = as;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });

    // Preload critical CSS
    const criticalCSS = document.createElement("link");
    criticalCSS.rel = "preload";
    criticalCSS.href = "/_next/static/css/app/layout.css";
    criticalCSS.as = "style";
    document.head.appendChild(criticalCSS);
  }, []);

  return null;
}
