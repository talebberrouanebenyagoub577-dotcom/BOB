import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutPopup } from "@/components/CheckoutPopup";
import { UpsellModal } from "@/components/UpsellModal";
import { OfferSelector } from "@/components/OfferSelector";
import { PRODUCTS } from "@/data/products";

import { ProductViewTracker } from "@/components/ProductViewTracker";
import { BRAND, defaultSiteTitle } from "@/lib/brand";
import { getProductPageHeroUrl } from "@/lib/bundledProductMedia";
import { catalogMainSurfaceStyle } from "@/lib/catalogSurfaceStyle";

/** يمنع الاعتماد على نسخ HTML معادّة توليدها في بناء قديم كانت تُرجع 404 لـ /products/[id] */
export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface Props {
  /** Next.js 15+ / 16: route params are async */
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  return {
    title: product
      ? { absolute: `${product.nameAr} | ${BRAND.nameAr}` }
      : { absolute: defaultSiteTitle() },
    description: product?.descriptionAr ?? BRAND.metaDescriptionAr,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) notFound();

  const detailHeroSrc = getProductPageHeroUrl(product.id);

  return (
    <>
      <ProductViewTracker sku={product.sku} productId={product.id} />
      <Header />
      <CartDrawer />
      <CheckoutPopup />
      <UpsellModal />

      <main className="w-full pb-14" style={catalogMainSurfaceStyle}>
        <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* معرض صفحة المنتج — صورة المنتج الحالي فقط */}
          <div className="aspect-[4/3] bg-navy/5 rounded-2xl overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={detailHeroSrc ?? product.image}
              alt={product.nameAr}
              className="w-full h-full object-contain"
            />
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
              { q: "ما سياسة الإرجاع؟", a: "إرجاع مجاني خلال 7 أيام وفق الشروط المعلنة إذا لم يكن المنتج مناسباً." },
            ].map((faq) => (
              <details key={faq.q} className="bg-navy/5 rounded-xl p-4">
                <summary className="font-bold text-navy cursor-pointer list-none">{faq.q}</summary>
                <p className="text-navy/70 mt-2 text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
        </div>
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
