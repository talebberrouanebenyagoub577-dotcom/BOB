"use client";

interface Card {
  title: string;
  body: string;
  tag?: string;
}

interface Props {
  cards: Card[];
}

export function PdpScienceStrip({ cards }: Props) {
  return (
    <section className="my-14 md:my-20" aria-label="التفاصيل العلمية والمواد">
      <h2 className="font-black text-navy text-2xl md:text-3xl mb-3 text-center">
        المواد والتفاصيل الي تفرّق بتجربتك أول أيام وبعد أسبوع
      </h2>
      <p className="text-center text-navy/60 font-medium mb-10 max-w-2xl mx-auto text-sm md:text-base">
        نتكلم بتفاصيل قابلة للملاحظة وقت التثبيت ووقت الاستخدام — مو وعود بعيدة.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-navy/10 bg-white p-6 md:p-8 shadow-sm text-right flex flex-col gap-3 md:min-h-[220px]"
          >
            {c.tag && (
              <span className="self-start text-[11px] font-black uppercase tracking-wide bg-navy text-white px-2.5 py-1 rounded-md">
                {c.tag}
              </span>
            )}
            <h3 className="font-black text-navy text-lg md:text-xl leading-snug">{c.title}</h3>
            <p className="text-navy/75 leading-relaxed text-sm md:text-base flex-1">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
