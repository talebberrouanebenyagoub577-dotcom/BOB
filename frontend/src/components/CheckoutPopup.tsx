"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useCartStore } from "@/lib/store";
import { generateEventId } from "@/lib/eventId";
import { getTrackingSessionId } from "@/lib/serverTrack";
import clsx from "clsx";
import { isValidSaudiPhone, normalizeSaudiPhone } from "@/lib/saudiPhone";
import { PRODUCTS } from "@/data/products";
import { formatOrderApiError } from "@/lib/formatOrderApiError";

export function CheckoutPopup() {
  const { items, isCheckoutOpen, closeCheckout, openUpsell, upsellShownThisSession, total, clearCart } =
    useCartStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nameValid = name.trim().length >= 2 && !/^\d+$/.test(name.trim());
  const phoneValid = isValidSaudiPhone(phone);
  const formValid = nameValid && phoneValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    setLoading(true);
    setError("");

    const eventId = generateEventId();
    // Store event_id for post-upsell order submission
    sessionStorage.setItem("pending_order", JSON.stringify({
      name: name.trim(),
      phone: normalizeSaudiPhone(phone),
      items: items.map((i) => ({
        sku: i.product.sku,
        qty: i.qty,
        unit_price: Math.round(i.price / i.qty),
        name_ar: i.product.nameAr,
      })),
      total: total(),
      event_id: eventId,
      session_id: getTrackingSessionId(),
    }));

    const cartSkus = new Set(items.map((i) => i.product.sku));
    const upsellCandidate = PRODUCTS.some((p) => !cartSkus.has(p.sku));

    /* لا تُغلق نافذة الدفع قبل إرسال الطلب عند تخطّي العرض الإضافي — وإلا تختفي رسالة الخطأ */
    if (!upsellShownThisSession && upsellCandidate) {
      closeCheckout();
      setLoading(false);
      openUpsell();
      return;
    }

    await submitOrder(false);
    setLoading(false);
  };

  async function submitOrder(upsellAccepted: boolean) {
    const raw = sessionStorage.getItem("pending_order");
    if (!raw) {
      setError("لم نجد بيانات الطلب. أعد فتح نموذج الطلب وحاول مرة أخرى.");
      setLoading(false);
      return;
    }
    let base: Record<string, unknown>;
    try {
      base = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      setError("بيانات الطلب تالفة. أعد المحاولة من البداية.");
      setLoading(false);
      return;
    }
    const payload = { ...base, upsell_accepted: upsellAccepted };
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
        /* تجاهل — قد يكون جسم HTML من البروكسي */
      }
      if (!res.ok) {
        setError(formatOrderApiError(res, data));
        setLoading(false);
        return;
      }
      sessionStorage.setItem("last_order", JSON.stringify({ ...payload, ...data }));
      clearCart();
      window.location.href = "/thank-you";
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقق من الإنترنت أو أن الخلفية تعمل.");
      setLoading(false);
    }
  }

  if (!isCheckoutOpen) return null;

  /* portal + طبقة أعلى من الشريط الثابت وأي عنصر داخل سياق تراكب في الصفحة */
  const overlay = (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="relative z-[201] bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[95dvh] overflow-y-auto shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-12 h-1.5 bg-navy/20 rounded-full" />
        </div>

        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="font-extrabold text-navy text-xl">تأكيد طلبكِ</h2>
            <button
              onClick={closeCheckout}
              className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center text-navy/50 hover:bg-navy/10 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Order summary */}
          <div className="bg-navy/5 rounded-xl p-4 space-y-2">
            {items.map((item) => (
              <div key={item.product.sku} className="flex justify-between text-sm font-medium">
                <span className="text-navy/70">
                  {item.product.shortAr} × {item.qty}
                </span>
                <span className="font-bold text-navy">{item.price} ر.س</span>
              </div>
            ))}
            <div className="border-t border-navy/10 pt-2 flex justify-between font-extrabold text-navy text-base">
              <span>الإجمالي</span>
              <span className="text-gold">{total()} ر.س</span>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-2 text-sm text-navy/60 bg-green-50 rounded-xl p-3">
            <span className="text-green-500 text-lg">⭐</span>
            <span>أكثر من 2,400 عميلة سعيدة — تقييم 4.9/5</span>
          </div>

          {/* Scarcity */}
          <p className="text-center text-sm font-bold text-red-600 bg-red-50 rounded-xl py-2">
            🔥 الكمية محدودة — اطلبي الآن قبل النفاد
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block font-bold text-navy mb-1.5 text-sm">
                الاسم الكريم
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك الكريم"
                className={clsx(
                  "w-full border-2 rounded-xl px-4 py-3 text-navy font-medium outline-none transition-colors",
                  nameValid || name === ""
                    ? "border-navy/20 focus:border-gold"
                    : "border-red-400 focus:border-red-400"
                )}
              />
              {!nameValid && name.length > 0 && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  يرجى إدخال اسم صحيح (حرفان على الأقل)
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold text-navy mb-1.5 text-sm">
                رقم الجوال
              </label>
              <input
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                maxLength={22}
                className={clsx(
                  "w-full border-2 rounded-xl px-4 py-3 font-mono tracking-wider text-navy outline-none transition-colors",
                  phoneValid || phone === ""
                    ? "border-navy/20 focus:border-gold"
                    : "border-red-400 focus:border-red-400"
                )}
              />
              <p className="text-navy/40 text-xs mt-1">
                نقبل الصيغ الشائعة مثل 05XXXXXXXX أو +9665XXXXXXXX أو 009665XXXXXXXX — نحوّلها تلقائياً عند التأكيد
              </p>
              {!phoneValid && phone.length > 0 && (
                <p className="text-red-500 text-xs mt-0.5 font-medium">
                  رقم الجوال لازم يكون سعودي بصيغة تعادل «05XXXXXXXX» (أو نفس المعنى بتنسيق دولي)
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-sm font-bold text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={!formValid || loading}
              className="btn-gold w-full text-xl py-5"
            >
              {loading ? "جارٍ الإرسال..." : "تأكيد طلبي"}
            </button>
          </form>

          {/* COD reminder */}
          <p className="text-center text-navy/50 text-xs font-medium">
            💳 الدفع عند الاستلام — لا حاجة لبطاقة الآن
          </p>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(overlay, document.body)
    : null;
}
