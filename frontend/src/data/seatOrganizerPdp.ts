import type { StaticImageData } from "next/image";
import type { PdpZigzagBlock } from "@/components/ProductPdpZigzag";
import i01 from "@/assets/product-detail/seat-organizer-pdp/01-tan-dual-seat.png";
import i03 from "@/assets/product-detail/seat-organizer-pdp/03-beige-cabin.png";
import i04 from "@/assets/product-detail/seat-organizer-pdp/04-brown-stitch.png";

function assetUrl(a: string | StaticImageData): string {
  return typeof a === "string" ? a : a.src;
}

/** أقسام توضيحية لمنتج «المنظّم الذكي للمقعد الدقيق» — تنسيق متناوب في الصفحة */
export const SEAT_ORGANIZER_STORY_BLOCKS: PdpZigzagBlock[] = [
  {
    key: "tan-dual",
    title: "جيوب متعددة لمقعدين في لقطة واحدة",
    body:
      "منظر من الخلف يظهر منظّمين متطابقين على ظهيرتي المقاعد الأمامية؛ جلد بلون دافئ ينسجم مع الداخلية. حامل واضح للوحي في الأعلى، حاملَا مشروبات جانبيان، فتحة مناديل في الوسط، حزام للمظلة، وجيب سفلي واسع للكتب والخرائط — ترتيب عملي لرحلات العائلة دون فوضى الأرضية.",
    imageSrc: assetUrl(i01),
  },
  {
    key: "beige-cabin",
    title: "تنظيم يومي واضح من مقعد الخلف",
    body:
      "لقطة من داخل السيارة تبيّن منظّماً بلون البيج القريب للجلد؛ جيب للهاتف في الأعلى، حاملَا مشروبات على الجوانب، مكان لوضع علبة المناديل، حزام يثبّت مظلاً مطوية، وجيب عريض في الأسفل للوحي أو الدفتر. خامة تتحمّل الاستخدام المتكرّر وسهلة المسح، وتخدم ركّاب الخلف بدون تعطيل وضع المقعد أو إزعاج السائق.",
    imageSrc: assetUrl(i03),
  },
  {
    key: "brown-stitch",
    title: "لمسة فخامة بخياطة بيضاء واضحة",
    body:
      "جلد بني غني مع خياطة متباينة تحدد شكل الجيوب وتعطي إحساس جودة أعلى دون التضحية بالوظيفة: نفس الترتيب الذكي للهاتف والمشروبات والمناديل والمظلة والأجهزة الأكبر — يجعل المقصورة تبدو مرتبة و«أغلى» من أول نظرة.",
    imageSrc: assetUrl(i04),
  },
];
