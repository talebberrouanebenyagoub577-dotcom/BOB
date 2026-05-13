"use client";

import Image from "next/image";

export interface TestimonialItem {
  quoteAr: string;
  authorAr: string;
  cityAr: string;
}

interface Props {
  items: TestimonialItem[];
  productImageSrc: string;
  productName: string;
}

export function PdpTestimonialsStrip({
  items,
  productImageSrc,
  productName,
}: Props) {
  return (
    <section className="my-14 md:my-20" aria-label="آراء عميلات">
      <h2 className="font-black text-navy text-2xl md:text-3xl mb-10 text-center">
        كلام من أول أسابيع — مو حكي عام بالفاضي
      </h2>
      <div className="space-y-8 md:space-y-10">
        {items.map((r, idx) => {
          const imageFirst = idx % 2 === 0;
          return (
            <article
              key={`${r.authorAr}-${idx}`}
              className="rounded-3xl border border-navy/10 bg-white shadow-md overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-0 md:gap-10 md:items-stretch">
                <div
                  className={`relative w-full h-[260px] sm:h-[280px] md:h-[340px] bg-gradient-to-br from-navy/[0.07] via-white to-gold/[0.12] flex items-center justify-center p-6 md:p-10 ${
                    imageFirst ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <div className="relative w-full h-full max-w-[440px] mx-auto">
                    <Image
                      src={productImageSrc}
                      alt={productName}
                      fill
                      className="object-contain drop-shadow-lg"
                      sizes="(max-width:768px) 100vw, 50vw"
                    />
                  </div>
                </div>
                <div
                  className={`flex flex-col justify-center p-7 md:p-10 text-right ${
                    imageFirst ? "md:order-2" : "md:order-1"
                  }`}
                >
                  <div className="text-gold text-xl mb-3 tracking-wide" aria-hidden>
                    ★★★★★
                  </div>
                  <blockquote className="text-navy font-bold text-lg md:text-2xl leading-relaxed mb-5">
                    &ldquo;{r.quoteAr}&rdquo;
                  </blockquote>
                  <cite className="not-italic font-extrabold text-navy/55 text-base">
                    — {r.authorAr} • {r.cityAr}
                  </cite>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
