import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const legacyApi = env.VITE_LEGACY_API_ORIGIN || "http://127.0.0.1:8787";
  /** Python FastAPI — admin login + metrics / orders API (Docker & local uvicorn :8000) */
  const adminApi = env.VITE_ADMIN_API_ORIGIN || "http://127.0.0.1:8000";

  const legacyProxy = { target: legacyApi, changeOrigin: true };
  const adminProxy = { target: adminApi, changeOrigin: true };

  return {
    plugins: [react()],
    css: {
      postcss: {
        plugins: [tailwindcss(), autoprefixer()],
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": legacyProxy,
        "/admin/auth": adminProxy,
        "/admin/metrics": adminProxy,
        "/admin/diagnose": adminProxy,
        "/admin/orders/clear": adminProxy,
        "/admin/orders": adminProxy,
      },
    },
    preview: {
      host: true,
      port: 4173,
      proxy: {
        "/api": legacyProxy,
        "/admin/auth": adminProxy,
        "/admin/metrics": adminProxy,
        "/admin/diagnose": adminProxy,
        "/admin/orders/clear": adminProxy,
        "/admin/orders": adminProxy,
      },
    },
  };
});
