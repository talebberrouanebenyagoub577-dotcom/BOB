import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutPopup } from "@/components/CheckoutPopup";
import { UpsellModal } from "@/components/UpsellModal";
import { OfferSelector } from "@/components/OfferSelector";
import { PRODUCTS } from "@/data/products";

interface Props {
  params: { id: string };
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: Props) {
  const product = PRODUCTS.find((p) => p.id === params.id);
  return { title: product ? `${product.nameAr} | نيدها اوتو` : "نيدها اوتو" };
}

export default function ProductPage({ params }: Props) {
  const product = PRODUCTS.find((p) => p.id === params.id);
  if (!product) notFound();

  return (
    <>
      <Header />
      <CartDrawer />
      <CheckoutPopup />
      <UpsellModal />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Gallery */}
          <div className="aspect-square bg-navy/5 rounded-2xl flex items-center justify-center text-8xl">
            🛍️
          </div>

          {/* Info */}
          <div className="space-y-5">
            {/* Stars */}
            <div className="flex items-center gap-2">
              <span className="flex gap-0.5">
                {Array(5).fill(null).map((_, i) => (
                  <span key={i} className="text-gold text-lg">★</span>
                ))}
              </span>
              <span className="text-navy/50 text-sm font-medium">(248 تقييم)</span>
            </div>

            <h1 className="font-extrabold text-navy text-3xl leading-tight">
              {product.nameAr}
            </h1>
            <p className="text-navy/60 text-lg">{product.descriptionAr}</p>

            {/* Scarcity */}
            <p className="inline-block bg-red-50 text-red-600 font-bold text-sm px-3 py-1.5 rounded-lg">
              🔥 ٧ قطع فقط متبقية
            </p>

            {/* Benefits */}
            <ul className="space-y-2">
              {product.benefits.map((b) => (
                <li key={b} className="flex items-center gap-2 text-navy font-medium">
                  <span className="text-green-500 font-black">✓</span>
                  {b}
                </li>
              ))}
            </ul>

            {/* Offer selector */}
            <OfferSelector product={product} />
          </div>
        </div>

        {/* How it works */}
        <section className="mt-16">
          <h2 className="font-extrabold text-navy text-2xl mb-6 text-center">كيف يعمل؟</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: "١", text: "اختاري الكمية المناسبة" },
              { step: "٢", text: "أكملي طلبك بالاسم والجوال" },
              { step: "٣", text: "انتظري التوصيل السريع" },
              { step: "٤", text: "ادفعي عند الاستلام" },
            ].map((s) => (
              <div key={s.step} className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-gold/20 text-gold font-black text-xl flex items-center justify-center mx-auto">
                  {s.step}
                </div>
                <p className="text-navy font-semibold text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14 max-w-2xl mx-auto">
          <h2 className="font-extrabold text-navy text-2xl mb-6 text-center">أسئلة شائعة</h2>
          <div className="space-y-3">
            {[
              { q: "هل التركيب سهل؟", a: "نعم، يتم في أقل من دقيقتين بدون أدوات." },
              { q: "هل يناسب جميع السيارات؟", a: "يناسب معظم السيارات اليابانية والكورية والأمريكية." },
              { q: "ما سياسة الإرجاع؟", a: "إرجاع مجاني خلال 14 يوماً إذا لم تكوني راضية." },
            ].map((faq) => (
              <details key={faq.q} className="bg-navy/5 rounded-xl p-4">
                <summary className="font-bold text-navy cursor-pointer list-none">{faq.q}</summary>
                <p className="text-navy/70 mt-2 text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-navy/10 p-4 z-30">
        <OfferSelector product={product} />
      </div>
      <div className="md:hidden h-40" /> {/* spacer for sticky bar */}

      <Footer />
    </>
  );
}
