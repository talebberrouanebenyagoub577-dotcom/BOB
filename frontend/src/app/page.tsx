import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CheckoutPopup } from "@/components/CheckoutPopup";
import { UpsellModal } from "@/components/UpsellModal";
import { HeroTrackLinks } from "@/components/HeroTrackLinks";
import { PRODUCTS } from "@/data/products";
import { BRAND } from "@/lib/brand";

const REVIEWS = [
  {
    name: "نورة م.",
    city: "الرياض",
    initial: "ن",
    product: "المنظّم الذكي للمقعد",
    text: "المنظّم غيّر حياتي. سيارتي كانت فوضى وكنت أخجل من أي راكب. الحين كل شيء له مكان والسيارة تبيّن شخصيتي.",
    stars: 5,
  },
  {
    name: "سارة ع.",
    city: "جدة",
    initial: "س",
    product: "حامي فراغ المقعد",
    text: "كل يوم أدور مفاتيحي في نفس الفتحة الملعونة. بعد الحامي — صفر مشاكل. اشتريت نسخة ثانية لسيارة أهلي.",
    stars: 5,
  },
  {
    name: "ريم ا.",
    city: "الدمام",
    initial: "ر",
    product: "طقم مرايا الاصطفاف الدقيق",
    text: "موقف العمل ضيق وكنت أتوتر كل يوم. بعد طقم المرايا صرت أصطف بثقة. النتيجة من أول يوم والمواد قوية جداً.",
    stars: 5,
  },
];

const FAQS = [
  { q: "هل الدفع عند الاستلام فقط؟", a: "نعم، جميع طلباتنا بالدفع عند الاستلام. لا حاجة لبطاقة ائتمانية أو دفع إلكتروني مسبق." },
  { q: "كم يستغرق التوصيل؟", a: "2-5 أيام عمل لمعظم مناطق المملكة. الرياض وجدة والدمام عادةً 2-3 أيام." },
  { q: "هل يمكنني إرجاع المنتج؟", a: "نعم، نقبل الإرجاع خلال 7 أيام من تاريخ الاستلام إذا كان المنتج في حالته الأصلية." },
  { q: "هل المنتجات مناسبة لجميع السيارات؟", a: "نعم، منتجاتنا مصممة لتناسب معظم سيارات السيدان والـ SUV الشائعة في السعودية." },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <CheckoutPopup />
      <UpsellModal />

      <main>
        {/* Hero */}
        <section className="bg-navy text-white py-20 px-4 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 text-gold text-sm font-bold px-4 py-2 rounded-full mb-6">
              <span>✓</span>
              <span>إكسسوارات مقصورة مختارة — ثقة ووضوح</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
              مقصورة أنظف…
              <br />
              <span className="text-gold">قيادة أوثق</span>
            </h1>
            <p className="text-white/75 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              {BRAND.nameAr} تجمع لك منظّم المقعد، حامي فراغ المقعد، وطقم مرايا الركن — منتجات نستخدمها
              لحلّ فوضى داخل السيارة وقلق المواقف الضيقة، مع الدفع عند الاستلام والتوصيل داخل المملكة.
            </p>
            <HeroTrackLinks />
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-white/70"><span className="text-gold">✓</span> الدفع عند الاستلام</span>
              <span className="flex items-center gap-1 text-white/70"><span className="text-gold">✓</span> توصيل سريع 2-5 أيام</span>
              <span className="flex items-center gap-1 text-white/70"><span className="text-gold">✓</span> إرجاع مجاني 7 أيام</span>
            </div>
          </div>
        </section>

        {/* Pain strip */}
        <section className="bg-gold/10 py-10 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: "🔧", title: "الفوضى في السيارة", desc: "أغراضك في كل مكان ومكان راحة ركابك يعاني؟ المنظّم يحل هذا فورياً." },
              { icon: "🔑", title: "أغراض تختفي يومياً", desc: "مفاتيح، سماعات، عملات — كلها تختفي في فتحة المقعد كل يوم." },
              { icon: "🚗", title: "قلق الاصطفاف", desc: "الزاوية العمياء والأماكن الضيقة — زد مجال رؤيتك واصطف بثقة." },
            ].map((item) => (
              <div key={item.title} className="space-y-2">
                <p className="text-4xl">{item.icon}</p>
                <h3 className="font-bold text-navy text-base">{item.title}</h3>
                <p className="text-navy/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <span className="text-gold text-sm font-bold uppercase tracking-widest">منتجاتنا</span>
            <h2 className="font-extrabold text-navy text-3xl mt-2">المنظومة الكاملة</h2>
            <p className="text-navy/60 mt-2">ثلاثة منتجات. ثلاث مشاكل محلولة. سيارة أهدأ وأنت أكثر راحة.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Trust section */}
        <section className="bg-navy/5 py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
            <span className="text-gold text-sm font-bold uppercase tracking-widest">لماذا {BRAND.nameAr}</span>
              <h2 className="font-extrabold text-navy text-3xl mt-2">ثقتك تهمنا</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "💳", title: "الدفع عند الاستلام", desc: "لا بطاقة، لا دفع مسبق. ادفع بعد ما يوصل المنتج بين يديك." },
                { icon: "📦", title: "توصيل سريع", desc: "2-5 أيام عمل لجميع مناطق المملكة العربية السعودية." },
                { icon: "↩️", title: "إرجاع مجاني", desc: "راجع المنتج وإذا ما عجبك — إرجاع مجاني خلال 7 أيام." },
                { icon: "🧪", title: "منتجات مختبرة", desc: "اخترنا كل منتج لحل مشكلة يومية حقيقية في بيئة القيادة السعودية." },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-5 text-center shadow-sm">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h4 className="font-bold text-navy mb-2">{item.title}</h4>
                  <p className="text-navy/60 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-gold text-sm font-bold uppercase tracking-widest">آراء عملائنا</span>
              <h2 className="font-extrabold text-navy text-3xl mt-2">ماذا قالوا عنّا</h2>
              <p className="text-navy/60 mt-2">تجارب عملاء يشاركونا انطباعهم بعد استخدام الإكسسوارات في يومهم.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {REVIEWS.map((r) => (
                <div key={r.name} className="bg-navy/5 rounded-2xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold text-white font-black flex items-center justify-center text-lg">
                        {r.initial}
                      </div>
                      <div>
                        <p className="font-bold text-navy text-sm">{r.name}</p>
                        <p className="text-navy/50 text-xs">📍 {r.city}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array(r.stars).fill(null).map((_, i) => (
                        <span key={i} className="text-gold text-sm">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-navy/70 text-sm leading-relaxed mb-3">"{r.text}"</p>
                  <p className="text-xs text-navy/40 font-medium">✓ اشترت: {r.product}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto px-4 py-14">
          <div className="text-center mb-8">
            <span className="text-gold text-sm font-bold uppercase tracking-widest">أسئلة شائعة</span>
            <h2 className="font-extrabold text-navy text-3xl mt-2">عندك سؤال؟</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="bg-navy/5 rounded-xl p-4 group">
                <summary className="font-bold text-navy cursor-pointer list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-gold group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="text-navy/70 mt-3 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
