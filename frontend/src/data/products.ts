import type { Product, PriceTier } from "@/types";

export const PRODUCTS: Product[] = [
  {
    id: "seat-organizer",
    sku: "NM-SO-001",
    nameAr: "المنظّم الذكي للمقعد",
    shortAr: "منظّم ذكي",
    descriptionAr:
      "يحوّل مقعد سيارتك إلى مساحة منظّمة — بدون فوضى، بدون تشتّت.",
    price: 199,
    image: "/images/seat-organizer.jpg",
    benefits: [
      "جيوب واسعة لكل احتياجاتك",
      "تثبيت قوي لا يتحرك",
      "سهل التركيب والتنظيف",
    ],
  },
  {
    id: "seatgap-protector",
    sku: "NM-SG-001",
    nameAr: "حامي فراغ المقعد",
    shortAr: "حامي المقعد",
    descriptionAr: "أوقفي سقوط الأشياء بين المقاعد للأبد.",
    price: 199,
    image: "/images/seatgap-protector.jpg",
    benefits: [
      "يسد الفراغ بإحكام تام",
      "مادة سيليكون مقاومة للحرارة",
      "يناسب جميع أنواع السيارات",
    ],
  },
  {
    id: "parking-mirror",
    sku: "NM-PM-001",
    nameAr: "طقم مرايا الاصطفاف الدقيق",
    shortAr: "طقم المرايا",
    descriptionAr: "اصطفّي بثقة — زوايا عمياء لم تعد موجودة.",
    price: 199,
    image: "/images/parking-mirror.jpg",
    benefits: [
      "رؤية 360° للزوايا العمياء",
      "تركيب في ثوانٍ",
      "مقاوم للأشعة فوق البنفسجية",
    ],
  },
];

export const PRICE_TIERS: PriceTier[] = [
  { qty: 1, price: 199 },
  { qty: 2, price: 279, saveAr: "وفّري 119 ر.س" },
  { qty: 3, price: 349, saveAr: "وفّري 248 ر.س" },
];

export const UPSELL_PRICE = 99;

export function getTierPrice(qty: number): number {
  if (qty === 1) return 199;
  if (qty === 2) return 279;
  if (qty === 3) return 349;
  // 4+ units: floor(qty/3)*349 + remainder tier
  const sets = Math.floor(qty / 3);
  const rem = qty % 3;
  return sets * 349 + getTierPrice(rem === 0 ? 0 : rem);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
