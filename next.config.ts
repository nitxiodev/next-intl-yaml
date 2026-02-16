import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import NextBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    cssChunking: true,
    optimizePackageImports: ["@/modules", "@/shared"],
  },

  trailingSlash: false,

  outputFileTracingIncludes: {
    "/**": ["./generated/**/*"],
  },
};

const withNextIntl = createNextIntlPlugin();
const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withNextIntl(withBundleAnalyzer(nextConfig));
