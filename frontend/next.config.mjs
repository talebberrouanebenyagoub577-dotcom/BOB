/** @type {import('next').NextConfig} */

const backendUrl = "http://backend:8000";  // try also: organisat_backend, organisat-backend

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
