import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["recharts", "lucide-react", "antd"],
  },
  // Fix the workspace root warning
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
