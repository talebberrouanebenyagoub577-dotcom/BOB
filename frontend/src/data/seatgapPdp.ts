import type { StaticImageData } from "next/image";
import type { PdpZigzagBlock } from "@/components/ProductPdpZigzag";
import i01 from "@/assets/product-detail/seatgap-protector-pdp/01-composite.png";
import i02 from "@/assets/product-detail/seatgap-protector-pdp/02-phone-slot.png";
import i03 from "@/assets/product-detail/seatgap-protector-pdp/03-dual-cabin.png";
import i04 from "@/assets/product-detail/seatgap-protector-pdp/04-snug-fit.png";
import i05 from "@/assets/product-detail/seatgap-protector-pdp/05-seat-adjust.png";

function assetUrl(a: string | StaticImageData): string {
  return typeof a === "string" ? a : a.src;
}

/** أقسام حامي فراغ المقعد */
export const SEATGAP_STORY_BLOCKS: PdpZigzagBlock[] = [
  {
    key: "pair-overview",
    title: "قطعتان جاهزتان — لجهتي السيارة الأمامية",
    body:
      "زوج من الحواجز السوداء المرنة يملآن الفجوة بين المقعد والكونسول. شكل مدمج مع خطاف للحزام — مناسب للسائق والراكب الأمامي.",
    imageSrc: assetUrl(i01),
  },
  {
    key: "storage-upgrade",
    title: "ترقية وظيفة التخزين — الالتقاط والوضع",
    body:
      "ضع هاتفك، مفاتيحك، وبطاقاتك في القناة الجانبية بدل ما تغرق بين المقعد والكونسول. وصول سريع أثناء القيادة دون لفّ تحت الموكيت.",
    imageSrc: assetUrl(i02),
  },
  {
    key: "dual-top",
    title: "تخزين متعدد الوظائف — سهولة التعليق",
    body:
      "سعة تحميل قوية: هاتف، شاحن، أو أغراض صغيرة تبقى معلّقة أو منزلقة في مكانها — بدون فوضى في الفجوة.",
    imageSrc: assetUrl(i03),
  },
  {
    key: "snug-integration",
    title: "لا يؤثر على وظائف السيارة — حزام الأمان يعمل طبيعياً",
    body:
      "محكم الارتباط ولا يسقط: مشبك الحزام يبقى ظاهراً وجاهزاً للاستخدام كما في السيارة الأصلية.",
    imageSrc: assetUrl(i04),
  },
  {
    key: "moves-with-seat",
    title: "تركيب غير تدميري — ثابت من أول وضع",
    body:
      "وصّله واضغطه في الفجوة — لم تعد فوضى عند زوال الفراغ. لا حاجة لأدوات أو تعديل دائم على السيارة.",
    imageSrc: assetUrl(i05),
  },
];
