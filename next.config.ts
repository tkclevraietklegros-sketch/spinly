import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "screen-capture=(self)",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
