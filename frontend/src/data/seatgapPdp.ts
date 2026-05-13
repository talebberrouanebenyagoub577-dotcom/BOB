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

/** أقسام حامي فراغ المقعد — صور جديدة بنصوص مناسبة للصفحة */
export const SEATGAP_STORY_BLOCKS: PdpZigzagBlock[] = [
  {
    key: "pair-overview",
    title: "قطعتان لجهتي السيارة — شكل واضح واستعمال واقعي",
    body:
      "أعلى الصورة: الحامي داخل الفجوة بين المقعد والكونسول مع جيب طويل، حامل كوب، وهاتف ومفاتيح في متناول اليد دون أن تنهبط للأسفل. أسفلها: نموذجان مطابقان يبرزان الخطاف الصغير وجهاز حمل المشروبات — مفيد إن رغبت بوحدة لكل مقعد أمامي.",
    imageSrc: assetUrl(i01),
  },
  {
    key: "storage-upgrade",
    title: "تخزين إضافي بسهولة ووصول مريح",
    body:
      "يُظهر المشهد كيف ينزلق الهاتف في القناة الطويلة أمام حامل الكوب بدل أن يختفي في ثغرة ضيقة تُرهقك وقت الالتقاط. المادة سوداء بملمس أنيق يتماشى مع جلد المقاعد في أغلب السيارات الحديثة.",
    imageSrc: assetUrl(i02),
  },
  {
    key: "dual-top",
    title: "كلا الجانبين: سدّ الفجوة وتوسيع السطح المفيد",
    body:
      "منظور من الأعلى يوضح التركيب المتناظر للسائق وللسائق المساعد: يقلّل سقوط العملات والأقلام، ويضيف سطحاً جانبياً للأدوات الصغيرة مع بقاء أزرار الكونسول وسيل الأمان في موضعها الطبيعي.",
    imageSrc: assetUrl(i03),
  },
  {
    key: "snug-integration",
    title: "تكامل مع المقعد دون إزعاج التعديل أو الحزام",
    body:
      "القطعة تملأ الفراغ بإحكام وتُبقي مشبك حزام الأمان ظاهراً ومجدداً للاستخدام. التصميم يهدف لثبات بصري ومادي أثناء القيادة دون تحميلك بتعديل معقّد في أول أيام التركيب.",
    imageSrc: assetUrl(i04),
  },
  {
    key: "moves-with-seat",
    title: "تتحرّك مع ضبط المقعد وتبقى بملء سلِس للفجوة",
    body:
      "عند جذب المقعد للأمام أو الخلف يبقى الحامي في دوره كسدادة عملية؛ السهم المرئي في الصورة يوضّح انسياب استعمال المقعد مع بقاء الملحق ضمن مسار الثغرة — أقل لفّ خلف الموكيت وضغط نفسي في الزحام.",
    imageSrc: assetUrl(i05),
  },
];
