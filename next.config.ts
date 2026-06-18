import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
  async redirects() {
    return [
      // Canonical host: anything served on the Vercel default alias is permanently
      // redirected to the real domain so the site is only reachable at www.bukara.de.
      {
        source: "/:path*",
        has: [{ type: "host", value: "bukara-web-app.vercel.app" }],
        destination: "https://www.bukara.de/:path*",
        permanent: true,
      },
      { source: "/angebote/x99-only", destination: "/produkte/x99-fraeser", permanent: true },
      { source: "/produkte", destination: "/katalog", permanent: true },
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
