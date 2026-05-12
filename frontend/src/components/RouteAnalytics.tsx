"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackServerEvent } from "@/lib/serverTrack";

/**
 * Fires server-side analytics for SPA navigations (pixels still run via PixelLoader).
 * Skips admin routes. page_view = every route; view_content = product detail focus.
 */
export function RouteAnalytics() {
  const pathname = usePathname();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (prev.current === pathname) return;
    prev.current = pathname;

    trackServerEvent("page_view");
    if (pathname.startsWith("/products/")) {
      trackServerEvent("view_content", { path: pathname });
    }
  }, [pathname]);

  return null;
}
