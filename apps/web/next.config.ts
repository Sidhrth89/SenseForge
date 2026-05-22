import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  turbopack: {
    root: repoRoot
  },
  transpilePackages: [
    "@senseforge/shared",
    "@senseforge/prompt-engine",
    "@senseforge/ai"
  ],
  experimental: {
    optimizePackageImports: ["lucide-react"]
  }
};

export default nextConfig;
