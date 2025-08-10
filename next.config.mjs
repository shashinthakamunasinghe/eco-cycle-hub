/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a minimal, deployable server bundle at .next/standalone
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/shop/profile",
        destination: "/customer-profile",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
