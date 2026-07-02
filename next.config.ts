import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* build autonome pour un déploiement Docker léger (.next/standalone) */
  output: "standalone",
};

export default nextConfig;
