import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-to-img", "@napi-rs/canvas"],
  outputFileTracingIncludes: {
    "/api/convert/pdf-to-image": ["./node_modules/@napi-rs/canvas-*/**"],
  },
  allowedDevOrigins: ["192.168.0.10"],
};

export default nextConfig;