import type { NextConfig } from "next";
import { resolve } from "path";

const projectDir = import.meta.dirname ?? resolve(".");

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
    buildActivityPosition: 'bottom-right',
  },
  turbopack: {
    root: projectDir,
    resolveAlias: {
      tailwindcss: resolve(projectDir, "node_modules/tailwindcss"),
      "tw-animate-css": resolve(projectDir, "node_modules/tw-animate-css"),
    },
  },
};

export default nextConfig;
