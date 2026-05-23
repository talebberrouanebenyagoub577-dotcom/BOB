import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  /** يثبّت جذر المشروع على مجلّد `frontend` رغم وجود `package-lock` في المستودع الأب — حتى يُخدم `public/product-detail` الصحيح */
  turbopack: {
    root: __dirname,
  },
  output: "standalone",
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/products", destination: "/shop", permanent: false },
    ];
  },

  async rewrites() {
    /** EasyPanel/Swarm: organisat_backend. Compose: backend. Local dev: 127.0.0.1 */
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL?.trim() ||
      (process.env.NODE_ENV === "production"
        ? "http://organisat_backend:8000"
        : "http://127.0.0.1:8000");
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      // Specific admin API paths only — a catch-all `/admin/:path*` breaks the Next.js `/admin` page (proxies HTML to FastAPI → 404 JSON).
      {
        source: "/admin/auth/:path*",
        destination: `${backendUrl}/admin/auth/:path*`,
      },
      {
        source: "/admin/metrics",
        destination: `${backendUrl}/admin/metrics`,
      },
      {
        source: "/admin/orders/clear",
        destination: `${backendUrl}/admin/orders/clear`,
      },
      {
        source: "/admin/orders",
        destination: `${backendUrl}/admin/orders`,
      },
      {
        source: "/admin/diagnose",
        destination: `${backendUrl}/admin/diagnose`,
      },
      {
        source: "/order",
        destination: `${backendUrl}/order`,
      },
    ];
  },
};

export default nextConfig;
