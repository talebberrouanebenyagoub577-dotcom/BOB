export interface PdpZigzagBlock {
  key: string;
  title: string;
  body: string;
  imageSrc: string;
}

interface Props {
  title: string;
  ariaLabel: string;
  blocks: PdpZigzagBlock[];
  /** إطار موحّد 1:1 يناسب صور المنتج المربّعة */
  imageFrame?: "default" | "square";
}

/** صورة أكبر بالديسكتوب + نفس الوزن البصري للنص (أقل تحسيسه صغير ومشروح كبير) */
export function ProductPdpZigzag({
  title,
  ariaLabel,
  blocks,
  imageFrame = "default",
}: Props) {
  const mediaShellClass =
    imageFrame === "square"
      ? "relative w-full aspect-square max-w-[min(100%,520px)] mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-navy/[0.06] to-white shadow-xl ring-1 ring-navy/10"
      : "relative w-full min-h-[min(92vw,420px)] sm:min-h-[300px] md:min-h-[380px] lg:min-h-[420px] rounded-2xl overflow-hidden bg-gradient-to-br from-navy/[0.06] to-white shadow-xl ring-1 ring-navy/10";
  return (
    <section
      className="mt-14 md:mt-20 border-t border-navy/10 pt-12 md:pt-16 scroll-mt-[5.75rem]"
      aria-label={ariaLabel}
    >
      <h2 className="text-center font-black text-navy text-2xl md:text-[1.85rem] leading-snug mb-10 md:mb-14 px-2">
        {title}
      </h2>
      <div className="space-y-12 md:space-y-24">
        {blocks.map((b, i) => (
          <article
            key={b.key}
            className={`flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-14 items-stretch lg:items-center ${
              i % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* صورة تأخذ ~ـ٦٠٪ بحجم أدنى أكبر وقت الديسكتوب */}
            <div className="w-full lg:w-[58%] xl:w-[55%] shrink-0">
              <div className={mediaShellClass}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.imageSrc}
                  alt={b.title}
                  className="absolute inset-0 h-full w-full object-contain object-center p-2 sm:p-4 md:p-7 lg:p-10"
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
            </div>
            <div className="w-full lg:flex-1 text-right flex flex-col justify-center space-y-4 md:space-y-5">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-navy leading-snug">
                {b.title}
              </h3>
              <p className="text-navy/78 leading-relaxed text-base md:text-xl max-w-xl lg:max-w-none">
                {b.body}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
