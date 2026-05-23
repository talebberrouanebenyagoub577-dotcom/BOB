"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { getTierPrice } from "@/data/products";
import { useCartStore } from "@/lib/store";
import { trackAddToCart, trackInitiateCheckout } from "@/lib/pixels";
import { trackServerEvent } from "@/lib/serverTrack";
import { usePdpQty } from "@/components/pdp/PdpQtyContext";

/** تمرّر العناوين لأعلى الشاشة مع ترك هوامش للـ header الثابت */
function scrollHeadlineIntoView(): void {
  const el =
    typeof document !== "undefined"
      ? document.getElementById("pdp-headline-anchor")
      : null;
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

interface StickyBarProps {
  showWhenBuyHidden: boolean;
}

export function PdpStickyCommerceBar({ showWhenBuyHidden }: StickyBarProps) {
  const { product, qty, setQty } = usePdpQty();
  const { addItem, openCheckout, isCheckoutOpen, isUpsellOpen } =
    useCartStore();
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    barRef.current?.style.setProperty("padding-bottom", "env(safe-area-inset-bottom)");
  }, []);

  const handleBuy = useCallback(() => {
    const price = getTierPrice(qty);
    addItem(product, qty);
    trackAddToCart(product.id, price);
    trackServerEvent("add_to_cart", {
      sku: product.sku,
      productId: product.id,
      qty,
      revenue: price,
    });
    const cartTotal = useCartStore.getState().total();
    trackInitiateCheckout(cartTotal);
    trackServerEvent("initiate_checkout", { value: cartTotal });
    openCheckout();
  }, [addItem, openCheckout, product, qty]);

  const price = getTierPrice(qty);

  /* لا يُعرض فوق نافذة التحقّق أو العرض الإضافي (نفس طبقة z تقريباً) */
  if (!showWhenBuyHidden || isCheckoutOpen || isUpsellOpen)
    return null;

  return (
    <footer
      ref={barRef}
      className={clsx(
        "fixed inset-x-0 bottom-0 z-[50]",
        "bg-white/96 backdrop-blur-md border-t border-navy/12 shadow-[0_-6px_30px_-8px_rgba(0,0,0,.2)]",
        "px-4 py-3 md:py-3.5"
      )}
      role="contentinfo"
      aria-label="شراء سريع وعرض الأسعار"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex gap-2 flex-1 overflow-x-auto md:justify-center pb-1 md:pb-0">
          {([1, 2, 3] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setQty(t)}
              className={clsx(
                "shrink-0 rounded-xl px-4 py-2 text-sm md:text-base font-bold border-2 transition-colors",
                qty === t
                  ? "border-gold bg-gold/15 text-navy"
                  : "border-navy/15 text-navy/60 hover:border-gold/40"
              )}
            >
              {t === 1 ? "١" : t === 2 ? "٢" : "٣"} — {getTierPrice(t)} ر.
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right ml-auto md:mx-0">
            <button
              type="button"
              onClick={scrollHeadlineIntoView}
              className="text-[11px] md:text-xs font-bold text-navy/50 hover:text-navy underline-offset-4 hover:underline block text-right mb-1"
            >
              تفاصيل المنتج والعناوين ↑
            </button>
            <p className="font-black text-navy tabular-nums text-lg whitespace-nowrap">
              {price} <span className="text-base">ر.س</span>
            </p>
          </div>
          <button type="button" onClick={handleBuy} className="btn-gold text-base md:text-lg py-4 px-6 md:py-4 md:px-8 whitespace-nowrap">
            اشتري الآن
          </button>
        </div>
      </div>
    </footer>
  );
}

/** تتبّع ظهور منطقة الشراء المرئية لتبديل الشريط */
export function useShowStickyWhenBuyNotVisible(enabled: boolean) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const sentinel = document.getElementById("pdp-buy-zone");
    if (!sentinel || typeof IntersectionObserver === "undefined") return;

    const obs = new IntersectionObserver(
      ([e]) => {
        /* عندما تختفي منطقة الشراء جزئياً من الشاشة → أظهر الشريط */
        setHidden(e.intersectionRatio < 0.35);
      },
      { threshold: [0, 0.15, 0.35, 0.5, 1], rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [enabled]);

  return hidden;
}
