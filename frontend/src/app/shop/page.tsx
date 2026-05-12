import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutPopup } from "@/components/CheckoutPopup";
import { UpsellModal } from "@/components/UpsellModal";
import { PRODUCTS, PRICE_TIERS } from "@/data/products";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "المنتجات" };

export default function CollectionPage() {
  return (
    <>
      <Header />
      <CartDrawer />
      <CheckoutPopup />
      <UpsellModal />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <p className="text-gold text-sm font-bold mb-2">{BRAND.taglineAr}</p>
          <h1 className="font-extrabold text-navy text-4xl mb-3">جميع المنتجات</h1>
          <p className="text-navy/60 text-lg max-w-2xl mx-auto">
            مجموعتنا الحالية تركّز على ثلاثة محاور: التنظيم، حماية الأغراض، ورؤية أوضح عند الركن — بجودة
            نوضحها وبتجربة طلب بسيطة مع {BRAND.nameAr}.
          </p>
        </div>

        {/* Pricing tiers banner */}
        <div className="bg-navy text-white rounded-2xl p-6 mb-10 grid grid-cols-3 gap-4 text-center">
          {PRICE_TIERS.map((tier) => (
            <div key={tier.qty}>
              <p className="font-black text-2xl text-gold">{tier.price} <span className="text-base">ر.س</span></p>
              <p className="text-white/70 text-sm mt-1">
                {tier.qty === 1 ? "قطعة واحدة" : tier.qty === 2 ? "قطعتان" : "٣ قطع"}
              </p>
              {tier.saveAr && (
                <p className="text-green-400 text-xs font-bold mt-0.5">{tier.saveAr}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
