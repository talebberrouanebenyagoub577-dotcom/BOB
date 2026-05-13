"use client";

interface Props {
  bullets: string[];
}

export function PdpPainBullets({ bullets }: Props) {
  return (
    <section className="my-12 md:my-16" aria-label="ليش هذا المنتج يهمّك اليوم؟">
      <h2 className="font-black text-navy text-2xl md:text-3xl mb-6 text-center leading-snug px-2">
        مشهد اليوم الي عِشْناه قبل ما نكمّل القطعة
      </h2>
      <ul className="max-w-3xl mx-auto space-y-4">
        {bullets.map((t) => (
          <li
            key={t}
            className="flex gap-4 items-start bg-white border border-red-500/15 rounded-2xl p-5 shadow-sm text-right"
          >
            <span
              className="shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 font-black text-lg"
              aria-hidden
            >
              !
            </span>
            <p className="text-navy/85 font-semibold leading-relaxed text-base md:text-lg pt-1">
              {t}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
