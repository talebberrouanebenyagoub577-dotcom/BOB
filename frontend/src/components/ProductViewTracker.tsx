"use client";

import { useEffect } from "react";
import { trackServerEvent } from "@/lib/serverTrack";

interface Props {
  sku: string;
  productId: string;
}

/** يشغّل تتبّع view_content مع تعريف المنتج (إضافة إلى page_view من RouteAnalytics). */
export function ProductViewTracker({ sku, productId }: Props) {
  useEffect(() => {
    trackServerEvent("view_content", { sku, productId });
  }, [sku, productId]);

  return null;
}
