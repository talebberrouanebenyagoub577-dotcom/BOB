"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackPurchase } from "@/lib/pixels";

interface OrderData {
  name: string;
  phone: string;
  total: number;
  event_id: string;
  order_number?: string;
  items: { sku: string; qty: number; unit_price: number }[];
}

export default function ThankYouPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 min

  useEffect(() => {
    const raw = sessionStorage.getItem("last_order");
    if (raw) {
      const data: OrderData = JSON.parse(raw);
      setOrder(data);
      trackPurchase(data.event_id, data.total, data.items.map((i) => i.sku));
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const maskedPhone = order?.phone
    ? order.phone.slice(0, 4) + "****" + order.phone.slice(-2)
    : "";

  return (
    <main className="min-h-screen bg-navy flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto text-5xl">
          ✅
        </div>

        <h1 className="font-extrabold text-navy text-3xl">طلبك مؤكد!</h1>

        {order && (
          <p className="text-navy/60">
            شكراً {order.name}! سنتواصل معكِ على{" "}
            <span className="font-mono font-bold text-navy">{maskedPhone}</span>
          </p>
        )}

        {order?.order_number && (
          <p className="bg-navy/5 rounded-xl py-3 px-4 font-bold text-navy">
            رقم الطلب: <span className="text-gold">{order.order_number}</span>
          </p>
        )}

        {/* What happens next */}
        <div className="text-right space-y-3">
          <p className="font-bold text-navy text-sm">ماذا يحدث الآن؟</p>
          {[
            "سيتصل بكِ فريقنا خلال 24 ساعة لتأكيد الطلب",
            "يتم تجهيز طلبك وشحنه خلال يوم عمل",
            "يصلك خلال 2-5 أيام عمل",
            "تدفعين عند استلام الطلب",
          ].map((step, i) => (
            <div key={step} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-navy/70 text-sm">{step}</p>
            </div>
          ))}
        </div>

        {/* Countdown */}
        <div className="bg-gold/10 rounded-xl p-4">
          <p className="text-navy/60 text-sm font-medium mb-1">مدة تأكيد الحجز</p>
          <p className="text-4xl font-black text-gold tabular-nums">
            {minutes}:{seconds}
          </p>
          <p className="text-navy/50 text-xs mt-1">خلّي جوالك قريب 📱</p>
        </div>

        <Link
          href="/"
          className="block btn-navy text-center"
        >
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}
