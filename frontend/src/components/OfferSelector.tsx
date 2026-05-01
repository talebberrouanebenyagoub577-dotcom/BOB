"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { PRICE_TIERS, getTierPrice } from "@/data/products";
import { useCartStore } from "@/lib/store";
import { trackAddToCart } from "@/lib/pixels";
import clsx from "clsx";

interface Props {
  product: Product;
}

export function OfferSelector({ product }: Props) {
  const [selectedQty, setSelectedQty] = useState(1);
  const { addItem, openDrawer } = useCartStore();

  const price = getTierPrice(selectedQty);

  const handleBuy = () => {
    addItem(product, selectedQty);
    trackAddToCart(product.id, price);
    openDrawer();
  };

  return (
    <div className="space-y-4">
      {/* Tier selection */}
      <div className="grid grid-cols-3 gap-3">
        {PRICE_TIERS.map((tier) => (
          <button
            key={tier.qty}
            onClick={() => setSelectedQty(tier.qty)}
            className={clsx(
              "rounded-xl border-2 p-3 text-center transition-all",
              selectedQty === tier.qty
                ? "border-gold bg-gold/10 text-navy"
                : "border-navy/10 bg-white text-navy/60 hover:border-gold/50"
            )}
          >
            <p className="font-black text-lg">{tier.qty}</p>
            <p className="text-xs font-medium">
              {tier.qty === 1 ? "قطعة" : tier.qty === 2 ? "قطعتين" : "قطع"}
            </p>
            <p className="font-bold text-gold text-sm mt-1">{tier.price} ر.س</p>
            {tier.saveAr && (
              <p className="text-xs text-green-600 font-semibold mt-0.5">
                {tier.saveAr}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between bg-navy/5 rounded-xl p-3">
        <span className="font-semibold text-navy/70">الإجمالي:</span>
        <span className="font-extrabold text-gold text-xl">
          {price} <span className="text-base">ر.س</span>
        </span>
      </div>

      {/* CTA */}
      <button onClick={handleBuy} className="btn-gold w-full text-xl py-5">
        اشتري الآن — {price} ر.س
      </button>

      {/* Trust chips */}
      <div className="grid grid-cols-2 gap-2 text-xs text-navy/60 font-medium">
        {["🚚 توصيل سريع", "💰 الدفع عند الاستلام", "🔄 إرجاع مجاني", "✅ ضمان الجودة"].map((t) => (
          <span key={t} className="flex items-center gap-1">{t}</span>
        ))}
      </div>
    </div>
  );
}
