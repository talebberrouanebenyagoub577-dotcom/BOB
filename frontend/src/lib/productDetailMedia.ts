/** صور صفحة المنتج — ملفات في `/public/product-detail` (PNG للصور الفعلية). */

const BASE = "/product-detail";

/** كولاج مشترك (الثلاثة منتجات) يظهر على كل صفحة منتج */
export const PRODUCT_PAGE_SHARED_SRC = `${BASE}/pdp-shared-cabin.png`;

/** صور توضيحية مشتركة تظهر على كل صفحة منتج */
export const PRODUCT_PAGE_HIGHLIGHT_IMAGES: ReadonlyArray<{ src: string; alt: string }> = [
  {
    src: `${BASE}/pdp-highlight-blind-spot.png`,
    alt: "مرآة الزاوية الميتة — تصميم دوران 360 درجة، تعديل بالضغط، مجال رؤية أوسع",
  },
  {
    src: `${BASE}/pdp-highlight-seat-gap.png`,
    alt: "حشوة فراغ المقعد — التركيب بين المقعد والكونسول وتنظيم المقتنيات دون سقوطها في الفراغ",
  },
];

const HERO_BY_ID: Record<string, string> = {
  "seat-organizer": `${BASE}/seat-organizer.png`,
  "seatgap-protector": `${BASE}/seatgap-protector.png`,
  "parking-mirror": `${BASE}/parking-mirror.png`,
};

export function getProductPageHeroUrl(productId: string): string | null {
  return HERO_BY_ID[productId] ?? null;
}
