/** @type {import('next').NextConfig} */

const backendUrl = "http://organisat_backend:80";

const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [],
  },
  async rewrites() {
    return [
      { source: "/order",           destination: `${backendUrl}/order` },
      { source: "/health",          destination: `${backendUrl}/health` },
      { source: "/admin/:path*",    destination: `${backendUrl}/admin/:path*` },
    ];
  },
};

export default nextConfig;
