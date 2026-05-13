import type { Product, PriceTier } from "@/types";

export const PRODUCTS: Product[] = [
  {
    id: "seat-organizer",
    sku: "nidha-K7XQ92",
    nameAr: "المنظّم الذكي للمقعد",
    shortAr: "منظّم ذكي",
    shortBenefit: "خلّي سيارتك مرتبة ومريحة دائماً",
    descriptionAr:
      "منظّم ذكي يحوّل مقعد سيارتك إلى مساحة منظمة بالكامل. جيوب متعددة، تصميم مرن، تركيب في دقيقتين.",
    price: 199,
    image: "/product-detail/seat-organizer.svg",
    badge: "الأكثر مبيعاً",
    reviewCount: 284,
    rating: 5,
    stock: 7,
    benefits: [
      "٦ جيوب متعددة الأحجام لكل أغراضك",
      "مادة أكسفورد المقاومة للماء والخدش",
      "تركيب وإزالة بدون أدوات في دقيقتين",
    ],
  },
  {
    id: "seatgap-protector",
    sku: "nidha-M4PW81",
    nameAr: "حامي فراغ المقعد",
    shortAr: "حامي المقعد",
    shortBenefit: "أوقف ضياع أغراضك في فتحة المقعد",
    descriptionAr:
      "يسد الفجوة بين المقعد والكونسول نهائياً. لا مزيد من فقدان المفاتيح أو الجوال أو العملات.",
    price: 199,
    image: "/product-detail/seatgap-protector.svg",
    badge: "مشكلة يومية",
    reviewCount: 197,
    rating: 5,
    stock: 12,
    benefits: [
      "يسد الفجوة تماماً — لا تسقط أغراض بعد الآن",
      "جيب تخزين جانبي للهاتف أو البطاقات",
      "سيليكون طبي مقاوم للحرارة حتى ٧٠ درجة",
    ],
  },
  {
    id: "parking-mirror",
    sku: "nidha-R9TZ73",
    nameAr: "طقم مرايا الاصطفاف الدقيق",
    shortAr: "طقم المرايا",
    shortBenefit: "اصطفّ بثقة في أضيق الأماكن",
    descriptionAr:
      "عدسة واسعة الزاوية تُريك الزوايا العمياء بوضوح تام. ثبّتها على مرآتك الخارجية وتخلص من قلق الاصطفاف.",
    price: 199,
    image: "/product-detail/parking-mirror.svg",
    badge: "ثقة بالقيادة",
    reviewCount: 156,
    rating: 5,
    stock: 9,
    benefits: [
      "عدسة واسعة ١٦٠ درجة ترى ما تعجز عنه مرآتك الأصلية",
      "تركيب في أقل من دقيقتين — بدون حفر أو أدوات",
      "زجاج مضاد للكسر ولاصق ٣M يتحمل ٨٠ درجة",
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
