/** صور صفحة المنتج — مدمجة عبر Vite من `src/assets` */
function productAsset(filename) {
  return new URL(`../assets/product-detail/${filename}`, import.meta.url).href;
}

/** كولاج مشترك (الثلاثة منتجات) يظهر على كل صفحة منتج */
export const PRODUCT_PAGE_SHARED_SRC = productAsset("pdp-shared-cabin.svg");

/** صور توضيحية مشتركة تظهر على كل صفحة منتج */
export const PRODUCT_PAGE_HIGHLIGHT_IMAGES = [
  {
    src: productAsset("parking-mirror.svg"),
    alt: "مرآة الزاوية الميتة — تصميم دوران 360 درجة، تعديل بالضغط، مجال رؤية أوسع",
  },
  {
    src: productAsset("seatgap-protector.svg"),
    alt: "حشوة فراغ المقعد — التركيب بين المقعد والكونسول وتنظيم المقتنيات دون سقوطها في الفراغ",
  },
];

const HERO_BY_ID = {
  "seat-organizer": productAsset("seat-organizer.svg"),
  "seatgap-protector": productAsset("seatgap-protector.svg"),
  "parking-mirror": productAsset("parking-mirror.svg"),
};

export function getProductPageHeroUrl(productId) {
  return HERO_BY_ID[productId] ?? null;
}
