"use client";

import { useEffect } from "react";
import { loadPixels } from "@/lib/pixels";

export function PixelLoader() {
  useEffect(() => {
    loadPixels();
  }, []);

  return null;
}
