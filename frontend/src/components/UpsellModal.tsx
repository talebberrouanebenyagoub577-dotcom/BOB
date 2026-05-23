"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCartStore } from "@/lib/store";
import { PRODUCTS, UPSELL_PRICE } from "@/data/products";
import { trackPurchase } from "@/lib/pixels";
import { formatOrderApiError } from "@/lib/formatOrderApiError";

const COUNTDOWN_SECONDS = 12;

export function UpsellModal() {
  const { items, isUpsellOpen, closeUpsell } = useCartStore();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [error, setError] = useState("");

  const cartSkus = new Set(items.map((i) => i.product.sku));
  const upsellProduct = PRODUCTS.find((p) => !cartSkus.has(p.sku));

  useEffect(() => {
    if (!isUpsellOpen) {
      setCountdown(COUNTDOWN_SECONDS);
      return;
    }
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          handleDecline();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpsellOpen]);

  const finalize = async (accepted: boolean) => {
    setError("");
    const raw = sessionStorage.getItem("pending_order");
    if (!raw) {
      setError("لم نجد بيانات الطلب. غادري أو أعيدي المحاولة من صفحة المنتج.");
      return;
    }

    let pending: {
      total: number;
      event_id: string;
      session_id?: string;
      items: { sku: string; qty: number; unit_price: number; name_ar: string }[];
      [key: string]: unknown;
    };
    try {
      pending = JSON.parse(raw) as typeof pending;
    } catch {
      setError("بيانات الطلب تالفة. أعيدي المحاولة من صفحة المنتج.");
      return;
    }
    const upsellDelta = accepted && upsellProduct ? UPSELL_PRICE : 0;
    const payload = {
      ...pending,
      total: pending.total + upsellDelta,
      upsell_accepted: accepted,
      upsell_sku: accepted && upsellProduct ? upsellProduct.sku : undefined,
      upsell_name_ar: accepted && upsellProduct ? upsellProduct.nameAr : undefined,
    };

    // Fire Purchase pixel
    const skus = payload.items.map((i) => i.sku);
    if (accepted && upsellProduct) skus.push(upsellProduct.sku);
    const value = payload.total;
    trackPurchase(String(payload.event_id), value, skus);

    try {
      const res = await fetch("/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data: Record<string, unknown> = {};
      try {
        data = (await res.json()) as Record<string, unknown>;
      } catch {
        /* تجاهل */
      }
      if (!res.ok) {
        setError(formatOrderApiError(res, data));
        return;
      }
      sessionStorage.setItem("last_order", JSON.stringify({ ...payload, ...data }));
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقق من أن الخلفية تعمل ثم أعد المحاولة.");
      return;
    }

    closeUpsell();
    useCartStore.getState().clearCart();
    window.location.href = "/thank-you";
  };

  const handleAccept = () => finalize(true);
  const handleDecline = () => finalize(false);

  if (!isUpsellOpen || !upsellProduct) return null;

  const overlay = (
    <div className="fixed inset-0 bg-black/70 z-[210] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="relative z-[211] bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl p-6 space-y-5 shadow-2xl">
        {/* Countdown bar */}
        <div className="relative h-1.5 bg-navy/10 rounded-full overflow-hidden">
          <div
            className="absolute top-0 right-0 h-full bg-gold transition-all duration-1000"
            style={{ width: `${(countdown / COUNTDOWN_SECONDS) * 100}%` }}
          />
        </div>
        <p className="text-center text-xs text-navy/40 font-medium">
          ينتهي العرض خلال {countdown} ثانية
        </p>

        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-gold uppercase tracking-wide">
            عرض خاص مرة واحدة فقط
          </p>
          <h3 className="font-extrabold text-navy text-2xl leading-snug">
            أضيفي {upsellProduct.shortAr}
          </h3>
          <p className="text-navy/60 text-sm">{upsellProduct.descriptionAr}</p>
        </div>

        <div className="relative w-full aspect-[16/11] max-h-[220px] sm:max-h-[260px] mx-auto rounded-2xl overflow-hidden bg-navy/5">
          <Image
            src={upsellProduct.image}
            alt={upsellProduct.nameAr}
            fill
            className="object-contain object-center p-2 sm:p-4"
            sizes="(max-width:768px) 90vw, 400px"
          />
        </div>

        {/* Price */}
        <div className="text-center">
          <p className="text-navy/40 line-through text-lg">199 ر.س</p>
          <p className="text-4xl font-black text-gold">
            {UPSELL_PRICE} <span className="text-2xl">ر.س</span>
          </p>
          <p className="text-green-600 text-sm font-bold mt-1">وفّري 100 ر.س الآن</p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button onClick={handleAccept} className="btn-gold w-full text-lg py-4">
            نعم، أريدها بـ {UPSELL_PRICE} ر.س
          </button>
          <button
            onClick={handleDecline}
            className="w-full text-navy/40 text-sm font-medium py-2 hover:text-navy/60 transition-colors"
          >
            لا شكراً، لست مهتمة
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm font-bold text-center">{error}</p>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(overlay, document.body)
    : null;
}
