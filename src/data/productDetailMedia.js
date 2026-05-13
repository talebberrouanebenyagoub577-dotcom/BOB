/** صور بطل صفحة المنتج فقط — مدمجة عبر Vite من `src/assets` */
function productAsset(filename) {
  return new URL(`../assets/product-detail/${filename}`, import.meta.url).href;
}

const HERO_BY_ID = {
  "seat-organizer": productAsset("seat-organizer.png"),
  "seatgap-protector": productAsset("seatgap-protector.png"),
  "parking-mirror": productAsset("parking-mirror.png"),
};

export function getProductPageHeroUrl(productId) {
  return HERO_BY_ID[productId] ?? null;
}
