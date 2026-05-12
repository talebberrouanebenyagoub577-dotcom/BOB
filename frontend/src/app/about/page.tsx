import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "من نحن" };

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-14 space-y-10">
        <div className="text-center">
          <p className="text-gold text-sm font-bold uppercase tracking-widest mb-3">{BRAND.taglineAr}</p>
          <h1 className="font-extrabold text-navy text-4xl mb-4">من نحن</h1>
          <p className="text-navy/60 text-lg max-w-2xl mx-auto leading-relaxed">
            {BRAND.nameAr} — {BRAND.positioningAr}
          </p>
        </div>

        <div className="bg-navy text-white rounded-2xl p-8 space-y-4">
          <h2 className="font-extrabold text-gold text-2xl">قصتنا</h2>
          <p className="leading-relaxed text-white/85">
            انطلقنا من مشاكل يومية حقيقية في السيارة: فوضى المقصورة، ضياع الأغراض بين المقعد
            والكونسول، وقلق الاصطفاف في المواقف الضيقة. نؤمن بأن الإكسسوار الجيد ليس «زينة» فقط، بل
            أداة تُهدّئ يومك وتقلل التشتت على الطريق.
          </p>
          <p className="leading-relaxed text-white/80 text-sm">
            نفخر بكوننا علامة سعودية تركّز على الوضوح مع العميل: منتجات نختارها بنفسنا، نشرح فائدتها،
            ونربطها بتجربة طلب بسيطة مع الدفع عند الاستلام.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { num: "+2,400", label: "تفاعل وطلبات" },
            { num: "4.9/5", label: "رضا مُعلَن" },
            { num: "٣", label: "مجالات رئيسية" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gold-pale rounded-2xl p-5 border border-gold/20">
              <p className="font-black text-gold text-2xl">{stat.num}</p>
              <p className="text-navy font-semibold text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="font-extrabold text-navy text-2xl">قيمنا</h2>
          {[
            {
              icon: "🎯",
              title: "منتج له هدف",
              text: "كل صنف يحل إزعاجاً محدداً — لا حشو كتالوجات.",
            },
            {
              icon: "✨",
              title: "جودة ننطق بها",
              text: "نوضح المواد والاستخدام لأن المصداقية تبدأ من الشفافية.",
            },
            {
              icon: "🤝",
              title: "ثقة قبل الدفع",
              text: "الدفع عند الاستلام لتشعر بالراحة قبل أن تدفع نقداً.",
            },
          ].map((v) => (
            <div key={v.title} className="flex gap-4 p-4 bg-navy/5 rounded-xl">
              <span className="text-3xl" aria-hidden>
                {v.icon}
              </span>
              <div>
                <p className="font-bold text-navy">{v.title}</p>
                <p className="text-navy/60 text-sm mt-0.5">{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

