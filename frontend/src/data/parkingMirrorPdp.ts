import type { StaticImageData } from "next/image";
import type { PdpZigzagBlock } from "@/components/ProductPdpZigzag";
import i01 from "@/assets/product-detail/parking-mirror-pdp/01-feature-360.png";
import i02 from "@/assets/product-detail/parking-mirror-pdp/02-install-steps.png";
import i03 from "@/assets/product-detail/parking-mirror-pdp/03-on-mirror.png";
import i04 from "@/assets/product-detail/parking-mirror-pdp/04-wide-angle.png";
import i05 from "@/assets/product-detail/parking-mirror-pdp/05-dimensions.png";
import i06 from "@/assets/product-detail/parking-mirror-pdp/06-safety-compare.png";

function assetUrl(a: string | StaticImageData): string {
  return typeof a === "string" ? a : a.src;
}

export type ParkingMirrorStoryBlock = PdpZigzagBlock;

/** أقسام توضيحية خاصة بمنتج «طقم مرايا الاصطفاف الدقيق» فقط — تنسيق متناوب في الصفحة */
export const PARKING_MIRROR_STORY_BLOCKS: ParkingMirrorStoryBlock[] = [
  {
    key: "feature-360",
    title: "تصميم دوران ٣٦٠ درجة",
    body:
      "اضبطي زاوية المرآة الإضافية بالضغط الخفيف على الحافة — دوران كامل يقلّل «الزاوية الميتة» ويعطيك مجال رؤية أوسع عند الانسحاب، تغيير المسار، والركن في أماكن ضيقة.",
    imageSrc: assetUrl(i01),
  },
  {
    key: "install",
    title: "خطوات تثبيت واضحة",
    body:
      "نظّفي زجاج المرآة الأصلية، ثبّتي قاعدة الشفط في المكان المناسب، اضغطي على الوسط حتى يلتصق بشكل آمن، ثم أدخلي مرآة الزاوية واضبطي الميل حتى ترين الطريق الجانبي بوضوح — بدون أدوات معقّدة.",
    imageSrc: assetUrl(i02),
  },
  {
    key: "on-car",
    title: "مرايا إضافية لا تشغّل الرؤية الأساسية",
    body:
      "الشكل المدمج يجلس على ركن المرآة الخارجية دون أن يغطي معظم سطحها؛ تبقين ترين الوراء بشكل طبيعي مع لقطة أوسع للمؤخ والرصيف عند الحاجة.",
    imageSrc: assetUrl(i03),
  },
  {
    key: "wide",
    title: "مجال رؤية أوضح بجانب السيارة",
    body:
      "العدسة الواسعة توسّع ما ترينه في المراة الجانبية — مفيدة في الطرق السريعة والعمودي جنب السيارات المجاورة، لتقليل مفاجآت الظهور من خارج نطاق المرآة العادية.",
    imageSrc: assetUrl(i04),
  },
  {
    key: "size",
    title: "أبعاد عملية لمعظم المرآت",
    body:
      "الحجم مصمّم ليستقر في زاوية المرآة دون إزعاج؛ الأرقام المدونة على العلبة إرشادية للمقارنة — إن احتجتِ قيسي مقاس مرآتك قبل الطلب للاطمئنان.",
    imageSrc: assetUrl(i05),
  },
  {
    key: "safety",
    title: "فرق واضح: مع المرايا الإضافية وبدونها",
    body:
      "المخطط يبيّن كيف تتوسّع منطقة الرؤية مع المرآة الإضافية مقارنة بالمرآة الاعتيادية وحدها — أقلّ عمى جانبي يعني قرارات أنجح في الزحمة وعند الاصطفاف الموازي.",
    imageSrc: assetUrl(i06),
  },
];
