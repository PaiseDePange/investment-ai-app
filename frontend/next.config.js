/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ skip all ESLint rules
  },
  typescript: {
    ignoreBuildErrors: true,  // ✅ skip type checking too (optional)
  },
};

module.exports = nextConfig;
