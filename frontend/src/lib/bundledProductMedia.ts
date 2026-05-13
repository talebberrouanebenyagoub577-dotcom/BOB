/**
 * وسائط المنتج مُحمَّلة ضمن الشَفرَة لتُطبَع ضمن `_next/static/...`
 * وتعمل حتى عندما يفشل نشر مجلّد `public/` مع صورة standalone.
 */
import type { StaticImageData } from "next/image";
import parkingMirror from "@/assets/product-detail/parking-mirror.svg";
import pdpSharedCabin from "@/assets/product-detail/pdp-shared-cabin.svg";
import seatOrganizer from "@/assets/product-detail/seat-organizer.svg";
import seatgapProtector from "@/assets/product-detail/seatgap-protector.svg";

/** Next يعيد استيراد SVG كـ `StaticImageData`؛ `<img src={...}>` يحتاج نصاً (`.src`). */
function assetUrl(asset: string | StaticImageData): string {
  return typeof asset === "string" ? asset : asset.src;
}

/** صورة البطاقة وسلة المستخدم لمسار CDN نهائي */
export const PRODUCT_LIST_IMAGE_SRC: Record<string, string> = {
  "seat-organizer": assetUrl(seatOrganizer),
  "seatgap-protector": assetUrl(seatgapProtector),
  "parking-mirror": assetUrl(parkingMirror),
};

export const PRODUCT_PAGE_SHARED_SRC = assetUrl(pdpSharedCabin);

export const PRODUCT_PAGE_HIGHLIGHT_IMAGES: ReadonlyArray<{ src: string; alt: string }> = [
  {
    src: assetUrl(parkingMirror),
    alt: "مرآة الزاوية الميتة — تصميم دوران 360 درجة، تعديل بالضغط، مجال رؤية أوسع",
  },
  {
    src: assetUrl(seatgapProtector),
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
