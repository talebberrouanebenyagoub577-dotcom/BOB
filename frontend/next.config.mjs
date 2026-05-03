/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
    ],
    unoptimized: true,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://backend:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/admin/:path*",
        destination: `${backendUrl}/admin/:path*`,
      },
      {
        source: "/order",
        destination: `${backendUrl}/order`,
      },
    ];
  },
};

export default nextConfig;
