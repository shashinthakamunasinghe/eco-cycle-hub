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
};

export default nextConfig;
