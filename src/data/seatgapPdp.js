function asset(name) {
  return new URL(`../assets/product-detail/seatgap-protector-pdp/${name}`, import.meta.url).href;
}

export const SEATGAP_STORY_BLOCKS = [
  {
    key: "pair-overview",
    title: "قطعتان جاهزتان — لجهتي السيارة الأمامية",
    body:
      "زوج من الحواجز السوداء المرنة يملآن الفجوة بين المقعد والكونسول. شكل مدمج مع خطاف للحزام — مناسب للسائق والراكب الأمامي.",
    imageSrc: asset("01-composite.png"),
  },
  {
    key: "storage-upgrade",
    title: "ترقية وظيفة التخزين — الالتقاط والوضع",
    body:
      "ضع هاتفك، مفاتيحك، وبطاقاتك في القناة الجانبية بدل ما تغرق بين المقعد والكونسول. وصول سريع أثناء القيادة دون لفّ تحت الموكيت.",
    imageSrc: asset("02-phone-slot.png"),
  },
  {
    key: "dual-top",
    title: "تخزين متعدد الوظائف — سهولة التعليق",
    body:
      "سعة تحميل قوية: هاتف، شاحن، أو أغراض صغيرة تبقى معلّقة أو منزلقة في مكانها — بدون فوضى في الفجوة.",
    imageSrc: asset("03-dual-cabin.png"),
  },
  {
    key: "snug-integration",
    title: "لا يؤثر على وظائف السيارة — حزام الأمان يعمل طبيعياً",
    body:
      "محكم الارتباط ولا يسقط: مشبك الحزام يبقى ظاهراً وجاهزاً للاستخدام كما في السيارة الأصلية.",
    imageSrc: asset("04-snug-fit.png"),
  },
  {
    key: "moves-with-seat",
    title: "تركيب غير تدميري — ثابت من أول وضع",
    body:
      "وصّله واضغطه في الفجوة — لم تعد فوضى عند زوال الفراغ. لا حاجة لأدوات أو تعديل دائم على السيارة.",
    imageSrc: asset("05-seat-adjust.png"),
  },
];
