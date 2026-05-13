"use client";

import clsx from "clsx";

const ITEMS = [
  { icon: "💳", text: "الدفع عند الاستلام" },
  { icon: "📦", text: "شحن سريع داخل المملكة" },
  { icon: "🛡️", text: "ضمان ذهبي ٣٠ يوم • استرداد كامل بحسب الشروط" },
] as const;

export function PdpTrustRibbon() {
  return (
    <section
      className="rounded-2xl border-2 border-gold/35 bg-gradient-to-br from-navy/[0.04] via-white to-gold/[0.08] px-4 py-4 md:py-5 my-10 shadow-sm"
      aria-label="مزايا الطلب والشحن والضمان"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 text-center">
        {ITEMS.map((item) => (
          <div
            key={item.text}
            className={clsx(
              "flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-3 rounded-xl",
              "bg-white/85 border border-navy/10"
            )}
          >
            <span className="text-2xl" aria-hidden>
              {item.icon}
            </span>
            <span className="font-extrabold text-navy text-sm md:text-base leading-snug">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
