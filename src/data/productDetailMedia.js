/** صور صفحة المنتج فقط — لا تُستخدَم في البطاقات أو السلة */
const BASE = "/product-detail";

/** كولاج مشترك (الثلاثة منتجات) يظهر على كل صفحة منتج */
export const PRODUCT_PAGE_SHARED_SRC = `${BASE}/pdp-shared-cabin.png`;

/** صور توضيحية مشتركة تظهر على كل صفحة منتج */
export const PRODUCT_PAGE_HIGHLIGHT_IMAGES = [
  {
    src: `${BASE}/pdp-highlight-blind-spot.png`,
    alt: "مرآة الزاوية الميتة — تصميم دوران 360 درجة، تعديل بالضغط، مجال رؤية أوسع",
  },
  {
    src: `${BASE}/pdp-highlight-seat-gap.png`,
    alt: "حشوة فراغ المقعد — التركيب بين المقعد والكونسول وتنظيم المقتنيات دون سقوطها في الفراغ",
  },
];

const HERO_BY_ID = {
  "seat-organizer": `${BASE}/seat-organizer.png`,
  "seatgap-protector": `${BASE}/seatgap-protector.png`,
  "parking-mirror": `${BASE}/parking-mirror.png`,
};

export function getProductPageHeroUrl(productId) {
  return HERO_BY_ID[productId] ?? null;
}
