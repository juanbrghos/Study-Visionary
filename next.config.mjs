/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Allows robust production builds without stopping on external CSS declaration quirks
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

