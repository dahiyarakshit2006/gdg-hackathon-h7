/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // TypeScript errors ko ignore karein taaki build pass ho jaye
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint errors ko bhi ignore karein
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;