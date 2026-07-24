import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mupdf"],
  outputFileTracingIncludes: {
    "/api/convert/pdf-to-image": ["./node_modules/mupdf/dist/**"],
  },
  allowedDevOrigins: ["192.168.0.10"],
};

export default nextConfig;