import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
  async redirects() {
    return [
      { source: "/angebote/x99-only", destination: "/produkte/x99-fraeser", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "qdycgspamxfiurajizmt.supabase.co" },
    ],
  },
};

export default nextConfig;
