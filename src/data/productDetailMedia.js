/** صور صفحة المنتج فقط — لا تُستخدَم في البطاقات أو السلة */
const BASE = "/product-detail";

/** كولاج مشترك (الثلاثة منتجات) يظهر على كل صفحة منتج */
export const PRODUCT_PAGE_SHARED_SRC = `${BASE}/pdp-shared-cabin.svg`;

/** صور توضيحية مشتركة تظهر على كل صفحة منتج */
export const PRODUCT_PAGE_HIGHLIGHT_IMAGES = [
  {
    src: `${BASE}/parking-mirror.svg`,
    alt: "مرآة الزاوية الميتة — تصميم دوران 360 درجة، تعديل بالضغط، مجال رؤية أوسع",
  },
  {
    src: `${BASE}/seatgap-protector.svg`,
    alt: "حشوة فراغ المقعد — التركيب بين المقعد والكونسول وتنظيم المقتنيات دون سقوطها في الفراغ",
  },
];

const HERO_BY_ID = {
  "seat-organizer": `${BASE}/seat-organizer.svg`,
  "seatgap-protector": `${BASE}/seatgap-protector.svg`,
  "parking-mirror": `${BASE}/parking-mirror.svg`,
};

export function getProductPageHeroUrl(productId) {
  return HERO_BY_ID[productId] ?? null;
}
