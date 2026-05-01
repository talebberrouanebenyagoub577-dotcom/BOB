import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutPopup } from "@/components/CheckoutPopup";
import { UpsellModal } from "@/components/UpsellModal";
import { PRODUCTS } from "@/data/products";

export default function HomePage() {
  return (
    <>
      <Header />
      <CartDrawer />
      <CheckoutPopup />
      <UpsellModal />

      <main>
        {/* Hero */}
        <section className="bg-navy text-white py-16 px-4 text-center">
          <p className="text-gold font-bold text-sm uppercase tracking-widest mb-4">
            منتجات السيارات للمرأة السعودية
          </p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
            نظّم قيادتك.
            <br />
            <span className="text-gold">اهدأ يومك.</span>
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            منتجات مصممة خصيصاً لتجعل قيادتك أكثر راحة وتنظيماً
          </p>
          <a
            href="/shop"
            className="inline-block bg-gold text-white font-extrabold text-lg px-8 py-4 rounded-xl hover:bg-gold-light transition-colors"
          >
            تسوّقي الآن
          </a>
        </section>

        {/* Pain strip */}
        <section className="bg-gold/10 py-8 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: "🚗", text: "فوضى في المقعد؟" },
              { icon: "😤", text: "أشياء تسقط بين المقاعد؟" },
              { icon: "😰", text: "صعوبة في الاصطفاف؟" },
              { icon: "✨", text: "نيدها اوتو الحل!" },
            ].map((item) => (
              <div key={item.text} className="space-y-2">
                <p className="text-3xl">{item.icon}</p>
                <p className="font-bold text-navy text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="font-extrabold text-navy text-3xl text-center mb-10">
            منتجاتنا المميزة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Alternating sections */}
        <section className="max-w-6xl mx-auto px-4 py-10 space-y-16">
          {/* Section 1 — Image right / Text left */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="font-extrabold text-navy text-2xl">
                قيادة بلا فوضى
              </h3>
              <p className="text-navy/70 leading-relaxed">
                منتجاتنا صُممت لتحوّل سيارتك من مساحة مشتتة إلى بيئة منظمة تعكس شخصيتك وترتيبك.
              </p>
            </div>
            <div className="aspect-video bg-navy/10 rounded-2xl flex items-center justify-center text-6xl order-first md:order-last">
              🚗
            </div>
          </div>

          {/* Section 2 — Image left / Text right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="aspect-video bg-gold/10 rounded-2xl flex items-center justify-center text-6xl">
              ⭐
            </div>
            <div className="space-y-4">
              <h3 className="font-extrabold text-navy text-2xl">
                ثقة أكثر من 2,400 عميلة
              </h3>
              <p className="text-navy/70 leading-relaxed">
                عميلاتنا يشاركن تجاربهن الإيجابية — منتجات تستحق الثقة وتستحق القيمة.
              </p>
            </div>
          </div>

          {/* Section 3 — Image right / Text left */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="font-extrabold text-navy text-2xl">
                توصيل سريع — الدفع عند الاستلام
              </h3>
              <p className="text-navy/70 leading-relaxed">
                لا حاجة لبطاقة ائتمانية. اطلبي الآن وادفعي عند وصول طلبك إليكِ.
              </p>
            </div>
            <div className="aspect-video bg-navy/10 rounded-2xl flex items-center justify-center text-6xl order-first md:order-last">
              🚚
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="bg-navy/5 py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-extrabold text-navy text-3xl text-center mb-10">
              ماذا تقول عميلاتنا؟
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "نورة م.", text: "المنظّم ممتاز! سيارتي أصبحت مرتبة تماماً", stars: 5 },
                { name: "سارة ع.", text: "حامي المقعد أوقف سقوط جوالي نهائياً!", stars: 5 },
                { name: "ريم خ.", text: "المرايا سهّلت الاصطفاف كثيراً. أنصح بها", stars: 5 },
              ].map((r) => (
                <div key={r.name} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex gap-0.5 mb-3">
                    {Array(r.stars).fill(null).map((_, i) => (
                      <span key={i} className="text-gold text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-navy/70 text-sm leading-relaxed mb-3">"{r.text}"</p>
                  <p className="font-bold text-navy text-sm">{r.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto px-4 py-14">
          <h2 className="font-extrabold text-navy text-3xl text-center mb-8">
            الأسئلة الشائعة
          </h2>
          <div className="space-y-4">
            {[
              { q: "كيف أدفع؟", a: "الدفع عند الاستلام — لا حاجة لبطاقة ائتمانية" },
              { q: "كم يستغرق التوصيل؟", a: "من 2 إلى 5 أيام عمل داخل المملكة" },
              { q: "هل يمكن الإرجاع؟", a: "نعم، إرجاع مجاني خلال 14 يوماً" },
            ].map((faq) => (
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
