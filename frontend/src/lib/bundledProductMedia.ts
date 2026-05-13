/**
 * صور المنتج مُحمَّلة ضمن البناء (PNG) — بطاقة المتجر + صورة بطل صفحة المنتج فقط.
 */
import type { StaticImageData } from "next/image";
import parkingMirror from "@/assets/product-detail/parking-mirror.png";
import seatOrganizer from "@/assets/product-detail/seat-organizer.png";
import seatgapProtector from "@/assets/product-detail/seatgap-protector.png";

function assetUrl(asset: string | StaticImageData): string {
  return typeof asset === "string" ? asset : asset.src;
}

export const PRODUCT_LIST_IMAGE_SRC: Record<string, string> = {
  "seat-organizer": assetUrl(seatOrganizer),
  "seatgap-protector": assetUrl(seatgapProtector),
  "parking-mirror": assetUrl(parkingMirror),
};

const heroById: Record<string, string> = {
  "seat-organizer": assetUrl(seatOrganizer),
  "seatgap-protector": assetUrl(seatgapProtector),
  "parking-mirror": assetUrl(parkingMirror),
};

export function getProductPageHeroUrl(productId: string): string | null {
  return heroById[productId] ?? null;
}
