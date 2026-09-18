import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow-list for remote images: only the Cloudinary host used by the
    // sign-in page mockups. No wildcards or other hosts.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;