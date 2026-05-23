"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { getTierPrice } from "@/data/products";
import { useCartStore } from "@/lib/store";
import { trackAddToCart, trackInitiateCheckout } from "@/lib/pixels";
import { trackServerEvent } from "@/lib/serverTrack";
import { usePdpQty } from "@/components/pdp/PdpQtyContext";

function scrollToBuyZone(): void {
  document.getElementById("pdp-buy-zone")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function useBuyZoneOffScreen() {
  const [offScreen, setOffScreen] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("pdp-buy-zone");
    if (!sentinel || typeof IntersectionObserver === "undefined") return;

    const obs = new IntersectionObserver(
      ([e]) => setOffScreen(e.intersectionRatio < 0.2),
      { threshold: [0, 0.2, 0.5, 1], rootMargin: "0px 0px -48px 0px" }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  return offScreen;
}

/** شريط «اشتري الآن» أسفل الشاشة — يظهر بعد ما الزبون ينزل يقرا تفاصيل الصفحة */
export function PdpStickyBuyBar() {
  const { product, qty } = usePdpQty();
  const offScreen = useBuyZoneOffScreen();
  const { addItem, openCheckout, isCheckoutOpen, isUpsellOpen } = useCartStore();
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    barRef.current?.style.setProperty("padding-bottom", "env(safe-area-inset-bottom)");
  }, []);

  const price = getTierPrice(qty);

  const handleBuy = useCallback(() => {
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
  }, [addItem, openCheckout, price, product, qty]);

  if (!offScreen || isCheckoutOpen || isUpsellOpen) return null;

  return (
    <footer
      ref={barRef}
      className={clsx(
        "fixed inset-x-0 bottom-0 z-[50]",
        "bg-white/97 backdrop-blur-md border-t border-navy/12 shadow-[0_-4px_24px_-6px_rgba(0,0,0,.18)]",
        "px-4 py-3"
      )}
      aria-label="اشتري الآن"
    >
      <div className="max-w-6xl mx-auto flex items-center gap-3">
        <button
          type="button"
          onClick={scrollToBuyZone}
          className="hidden sm:block text-[11px] font-bold text-navy/50 hover:text-navy underline-offset-4 hover:underline shrink-0"
        >
          ↑ العرض والكمية
        </button>
        <div className="text-right ml-auto sm:ml-0 sm:mr-auto tabular-nums">
          <p className="font-black text-navy text-lg leading-tight">
            {price} <span className="text-base">ر.س</span>
          </p>
          <p className="text-[10px] font-bold text-navy/45">الدفع عند الاستلام</p>
        </div>
        <button
          type="button"
          onClick={handleBuy}
          className="btn-gold text-base sm:text-lg py-3.5 px-5 sm:px-8 whitespace-nowrap shrink-0"
        >
          اشتري الآن
        </button>
      </div>
    </footer>
  );
}
