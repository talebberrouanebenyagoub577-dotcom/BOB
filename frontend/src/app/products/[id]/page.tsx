import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutPopup } from "@/components/CheckoutPopup";
import { UpsellModal } from "@/components/UpsellModal";
import { OfferSelector } from "@/components/OfferSelector";
import { PRODUCTS } from "@/data/products";
import { PDP_EXTRAS } from "@/data/pdpExtras";

import { ProductViewTracker } from "@/components/ProductViewTracker";
import { BRAND, defaultSiteTitle } from "@/lib/brand";
import { getProductPageHeroUrl } from "@/lib/bundledProductMedia";
import { catalogMainSurfaceStyle } from "@/lib/catalogSurfaceStyle";
import { PARKING_MIRROR_STORY_BLOCKS } from "@/data/parkingMirrorPdp";
import { SEAT_ORGANIZER_STORY_BLOCKS } from "@/data/seatOrganizerPdp";
import { SEATGAP_STORY_BLOCKS } from "@/data/seatgapPdp";
import { ProductPdpZigzag } from "@/components/ProductPdpZigzag";
import { ProductPdpShell } from "@/components/pdp/ProductPdpShell";
import { PdpTrustRibbon } from "@/components/pdp/PdpTrustRibbon";
import { PdpPainBullets } from "@/components/pdp/PdpPainBullets";
import { PdpTestimonialsStrip } from "@/components/pdp/PdpTestimonialsStrip";
import { PdpScienceStrip } from "@/components/pdp/PdpScienceStrip";
import { PdpCodPathStrip } from "@/components/pdp/PdpCodPathStrip";
import { PdpProductFaq } from "@/components/pdp/PdpProductFaq";
import { PdpFinalConfidence } from "@/components/pdp/PdpFinalConfidence";
import type { ProductId } from "@/types";

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

function storyBlocks(productId: ProductId) {
  switch (productId) {
    case "parking-mirror":
      return PARKING_MIRROR_STORY_BLOCKS;
    case "seat-organizer":
      return SEAT_ORGANIZER_STORY_BLOCKS;
    case "seatgap-protector":
      return SEATGAP_STORY_BLOCKS;
    default:
      return [];
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) notFound();

  const extras = PDP_EXTRAS[product.id as ProductId];
  const blocks = storyBlocks(product.id);
  const detailHeroSrc = getProductPageHeroUrl(product.id);
  const heroSrc = detailHeroSrc ?? product.image;

  const isWidePdpHero =
    product.id === "parking-mirror" ||
    product.id === "seat-organizer" ||
    product.id === "seatgap-protector";

  const stockLabel =
    product.stock <= 5
      ? `🔥 بقي ${product.stock} من دفعات الأسبوع — العرض يحمى بالتأكيد الهاتفي`
      : `متوفر للطلب الآن مع تأكيد سريع — الكميات تُدار أسبوعياً`;

  return (
    <>
      <ProductViewTracker sku={product.sku} productId={product.id} />
      <Header />
      <CartDrawer />
      <CheckoutPopup />
      <UpsellModal />

      <ProductPdpShell product={product}>
        <main className="w-full pb-4" style={catalogMainSurfaceStyle}>
          <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-start">
              <div
                className={`rounded-3xl bg-gradient-to-br from-navy/[0.04] via-white to-gold/[0.06] border border-navy/10 shadow-sm overflow-hidden w-full flex items-center justify-center ${
                  product.id === "parking-mirror"
                    ? "aspect-square max-sm:min-h-[min(300px,88vw)] xl:max-h-[520px]"
                    : isWidePdpHero
                      ? "aspect-[15/14] max-sm:min-h-[min(320px,88vw)] sm:aspect-[15/11] md:aspect-[15/10] xl:max-h-[540px]"
                      : "aspect-[4/5] max-sm:min-h-[min(300px,85vw)] sm:aspect-[4/3] lg:aspect-[16/13]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroSrc}
                  alt={product.nameAr}
                  className="w-full h-full max-h-full object-contain object-center p-2 sm:p-4 md:p-8 lg:p-10"
                  fetchPriority="high"
                />
              </div>

              <div className="space-y-5 lg:sticky lg:top-24 xl:top-28">
                <div
                  id="pdp-headline-anchor"
                  className="scroll-mt-[6rem] space-y-4 text-right"
                >
                  <div className="flex flex-wrap items-center gap-2 justify-start flex-row-reverse">
                    {product.badge && (
                      <span className="inline-flex bg-navy text-gold px-3 py-1 rounded-lg text-xs font-black">
                        {product.badge}
                      </span>
                    )}
                    <span className="text-navy/45 text-[11px] font-bold uppercase tracking-wide">
                      {BRAND.nameAr}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 justify-end flex-row-reverse flex-wrap">
                    <span className="flex gap-0.5" aria-hidden>
                      {Array(5)
                        .fill(null)
                        .map((_, i) => (
                          <span key={i} className="text-gold text-xl">
                            ★
                          </span>
                        ))}
                    </span>
                    <span className="text-navy/55 text-sm font-bold">
                      {product.rating.toFixed(1)}/٥ ({product.reviewCount.toLocaleString("ar-SA")}{" "}
                      تقييم مُثبت)
                    </span>
                  </div>

                  <h1 className="font-black text-navy text-2xl sm:text-3xl md:text-[2rem] leading-[1.25] lg:leading-tight">
                    {extras.headlineAr}
                  </h1>

                  <p className="text-gold font-extrabold text-base md:text-lg leading-snug">
                    {extras.promiseAr}
                  </p>

                  <p className="text-navy/55 text-sm font-medium leading-relaxed border-r-4 border-gold/70 pr-3">
                    <span className="text-navy/75 font-semibold">{product.nameAr}:</span>{" "}
                    {product.shortBenefit}
                  </p>

                  <p className="inline-flex items-center gap-2 bg-red-500/10 text-red-700 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl border border-red-500/20">
                    {stockLabel}
                  </p>

                  <ul className="space-y-2.5 pt-1">
                    {product.benefits.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 justify-end flex-row-reverse text-navy font-semibold text-sm md:text-base leading-snug"
                      >
                        <span className="text-emerald-500 font-black mt-0.5">✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <OfferSelector product={product} />
              </div>
            </div>

            <PdpTrustRibbon />

            <PdpPainBullets bullets={extras.painBulletsAr} />

            <PdpTestimonialsStrip
              items={extras.testimonialsAr}
              productImageSrc={heroSrc}
              productName={product.nameAr}
            />

            <PdpScienceStrip cards={extras.scienceCardsAr} />

            {blocks.length > 0 && (
              <ProductPdpZigzag
                title={extras.zigzagLeadAr}
                ariaLabel={`تفاصيل إضافية ${product.nameAr}`}
                blocks={blocks}
                imageFrame={
                  product.id === "parking-mirror" ? "square" : "default"
                }
              />
            )}

            <PdpCodPathStrip />

            <PdpProductFaq faqs={extras.faqAr} />

            <PdpFinalConfidence />
          </div>
        </main>
      </ProductPdpShell>

      <Footer />
    </>
  );
}
