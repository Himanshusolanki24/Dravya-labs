import type { NextConfig } from "next";
import { resolve } from "path";

const projectDir = import.meta.dirname ?? resolve(".");

const nextConfig: NextConfig = {
  transpilePackages: ['@openuidev/react-ui', '@openuidev/react-lang', '@openuidev/lang-core'],

  turbopack: {
    root: projectDir,
    resolveAlias: {
      tailwindcss: resolve(projectDir, "node_modules/tailwindcss"),
      "tw-animate-css": resolve(projectDir, "node_modules/tw-animate-css"),
    },
  },
};

export default nextConfig;
