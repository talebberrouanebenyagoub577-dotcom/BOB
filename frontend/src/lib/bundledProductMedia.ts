/**
 * صور منتج حقيقية (PNG من `src/assets/product-detail`).
 * تجنّب SVG الوهمية اللي كان فيها نص Placeholder على الواجحة.
 */
import type { StaticImageData } from "next/image";
import parkingMirror from "@/assets/product-detail/parking-mirror.png";
import blindSpotHighlight from "@/assets/product-detail/pdp-highlight-blind-spot.png";
import seatGapHighlight from "@/assets/product-detail/pdp-highlight-seat-gap.png";
import pdpSharedCabin from "@/assets/product-detail/pdp-shared-cabin.png";
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

export const PRODUCT_PAGE_SHARED_SRC = assetUrl(pdpSharedCabin);

export const PRODUCT_PAGE_HIGHLIGHT_IMAGES: ReadonlyArray<{ src: string; alt: string }> = [
  {
    src: assetUrl(blindSpotHighlight),
    alt: "مرآة الزاوية الميتة — تصميم دوران 360 درجة، تعديل بالضغط، مجال رؤية أوسع",
  },
  {
    src: assetUrl(seatGapHighlight),
    alt: "حشوة فراغ المقعد — التركيب بين المقعد والكونسول وتنظيم المقتنيات دون سقوطها في الفراغ",
  },
];

const heroById: Record<string, string> = {
  "seat-organizer": assetUrl(seatOrganizer),
  "seatgap-protector": assetUrl(seatgapProtector),
  "parking-mirror": assetUrl(parkingMirror),
};

export function getProductPageHeroUrl(productId: string): string | null {
  return heroById[productId] ?? null;
}
