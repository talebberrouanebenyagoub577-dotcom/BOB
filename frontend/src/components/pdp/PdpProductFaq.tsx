"use client";

interface Props {
  faqs: { q: string; a: string }[];
}

export function PdpProductFaq({ faqs }: Props) {
  return (
    <section className="mt-14 mb-12 max-w-3xl mx-auto" aria-labelledby="pdp-faq-heading">
      <h2 id="pdp-faq-heading" className="font-extrabold text-navy text-2xl mb-6 text-center">
        أسئلة تمرّ قبل ما تكمّلي الطلب
      </h2>
      <div className="space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="group bg-white border border-navy/10 rounded-2xl p-5 shadow-sm open:shadow-md transition-shadow"
          >
            <summary className="font-bold text-navy cursor-pointer list-none flex items-center justify-between gap-4 text-right">
              {faq.q}
              <span className="text-gold text-xl shrink-0 group-open:rotate-180 transition-transform">
                ⌄
              </span>
            </summary>
            <p className="text-navy/75 mt-4 text-sm md:text-base leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
