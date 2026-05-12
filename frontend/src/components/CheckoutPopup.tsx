"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store";
import { generateEventId } from "@/lib/eventId";
import { getTrackingSessionId } from "@/lib/serverTrack";
import clsx from "clsx";

function normalizeSaudiPhone(value: string): string {
  const digits = value.trim().replace(/[^\d+]/g, "");
  if (/^\+9665\d{8}$/.test(digits)) return `0${digits.slice(4)}`;
  if (/^9665\d{8}$/.test(digits)) return `0${digits.slice(3)}`;
  return digits;
}

function isValidSaudiPhone(value: string): boolean {
  return /^05\d{8}$/.test(normalizeSaudiPhone(value));
}

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

    closeCheckout();
    setLoading(false);

    if (!upsellShownThisSession) {
      openUpsell();
    } else {
      await submitOrder(false);
    }
  };

  async function submitOrder(upsellAccepted: boolean) {
    const raw = sessionStorage.getItem("pending_order");
    if (!raw) return;
    const payload = { ...JSON.parse(raw), upsell_accepted: upsellAccepted };
    try {
      const res = await fetch("/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("order failed");
      const data = await res.json();
      sessionStorage.setItem("last_order", JSON.stringify({ ...payload, ...data }));
      clearCart();
      window.location.href = "/thank-you";
    } catch {
      setError("حدث خطأ، يرجى المحاولة مرة أخرى");
      setLoading(false);
    }
  }

  if (!isCheckoutOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[95dvh] overflow-y-auto">
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
                placeholder="05XXXXXXXX أو +9665XXXXXXXX"
                maxLength={13}
                className={clsx(
                  "w-full border-2 rounded-xl px-4 py-3 font-mono tracking-wider text-navy outline-none transition-colors",
                  phoneValid || phone === ""
                    ? "border-navy/20 focus:border-gold"
                    : "border-red-400 focus:border-red-400"
                )}
              />
              <p className="text-navy/40 text-xs mt-1">مثال: 0512345678 أو +966512345678</p>
              {!phoneValid && phone.length > 0 && (
                <p className="text-red-500 text-xs mt-0.5 font-medium">
                  يرجى إدخال رقم سعودي صحيح مثل 05XXXXXXXX أو +9665XXXXXXXX
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
}
