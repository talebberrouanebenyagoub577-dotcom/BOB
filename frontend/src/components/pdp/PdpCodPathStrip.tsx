"use client";

const STEPS = [
  {
    step: "١",
    title: "تختارين الكمية من العرض الأسفل عن السلة مباشرة",
    body: "رقم وحدة واضح وفوري قبل ما تكمّلي الاسم والجوال لطلب تأكيدك.",
  },
  {
    step: "٢",
    title: "مكالمة تأكيد قصيرة قبل الشحن",
    body: "نثبت الاسم والعنوان ووقت المناسب — أحيانًا الرقم يظهر بدون اسم تطبيق، نطلب أنك تجاوبين لتأكيد التوصيل.",
  },
  {
    step: "٣",
    title: "شحن وسط المملكة بوقت حقيقي",
    body: "نبدأ التجهيز بعد التأكيد الهاتفي؛ غالبًا ٢–٥ أيام عمل حتى يدق الجرس وفق عنوانك.",
  },
  {
    step: "٤",
    title: "تدفعين عند الباب وتجربين",
    body: "الدفع عند الاستلام مع المندوب — ضمان ذهبي ثلاثين يوم استرداد كامل بحسب السياسة المعروضة.",
  },
] as const;

export function PdpCodPathStrip() {
  return (
    <section className="my-14 md:my-18 bg-navy text-white rounded-3xl px-5 py-10 md:px-10 md:py-12 shadow-xl overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-gold/25 via-transparent to-transparent pointer-events-none" />
      <div className="relative">
        <h2 className="font-black text-2xl md:text-3xl mb-2 text-center text-white">
          من كليك الطلب لمين يدقّ الجرس
        </h2>
        <p className="text-center text-white/75 text-sm md:text-base mb-10 max-w-2xl mx-auto">
          نخلي تأكيد هاتفي واضح عشان نرفع تأكيدك الفعلي ومعدل تمام التسليم وقت التوصيل.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="bg-white/[0.08] backdrop-blur-sm border border-white/15 rounded-2xl p-5 md:p-6 text-right"
            >
              <div className="w-11 h-11 rounded-full bg-gold text-navy font-black text-xl flex items-center justify-center mb-4">
                {s.step}
              </div>
              <h3 className="font-extrabold text-gold text-lg mb-2">{s.title}</h3>
              <p className="text-white/80 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
