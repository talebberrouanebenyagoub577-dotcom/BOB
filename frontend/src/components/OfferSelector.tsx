"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { PRICE_TIERS, getTierPrice } from "@/data/products";
import { useCartStore } from "@/lib/store";
import { trackAddToCart, trackInitiateCheckout } from "@/lib/pixels";
import { trackServerEvent } from "@/lib/serverTrack";
import { useOptionalPdpQty } from "@/components/pdp/PdpQtyContext";
import clsx from "clsx";

interface Props {
  product: Product;
}

export function OfferSelector({ product }: Props) {
  const optional = useOptionalPdpQty();
  const inner = useState(1);
  const selectedQty = optional ? optional.qty : inner[0];
  const setSelectedQty = optional ? optional.setQty : inner[1];

  const { addItem, openCheckout } = useCartStore();
  const price = getTierPrice(selectedQty);

  const handleBuy = () => {
    addItem(product, selectedQty);
    trackAddToCart(product.id, price);
    trackServerEvent("add_to_cart", {
      sku: product.sku,
      productId: product.id,
      qty: selectedQty,
      revenue: price,
    });
    const cartTotal = useCartStore.getState().total();
    trackInitiateCheckout(cartTotal);
    trackServerEvent("initiate_checkout", { value: cartTotal });
    openCheckout();
  };

  return (
    <div className="space-y-5" id="pdp-buy-zone">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {PRICE_TIERS.map((tier) => (
          <button
            key={tier.qty}
            type="button"
            onClick={() => setSelectedQty(tier.qty)}
            className={clsx(
              "rounded-xl border-2 p-3 sm:p-3.5 text-center transition-all",
              selectedQty === tier.qty
                ? "border-gold bg-gold/12 text-navy shadow-sm ring-2 ring-gold/20"
                : "border-navy/10 bg-white text-navy/60 hover:border-gold/40"
            )}
          >
            <p className="font-black text-xl sm:text-2xl">{tier.qty}</p>
            <p className="text-[11px] sm:text-xs font-bold text-navy/50">
              {tier.qty === 1 ? "قطعة" : tier.qty === 2 ? "قطعتين" : "ثلاث قطع"}
            </p>
            <p className="font-bold text-gold text-base sm:text-lg mt-1">{tier.price} ر.س</p>
            {tier.saveAr && (
              <p className="text-[10px] sm:text-xs text-green-600 font-semibold mt-0.5">
                {tier.saveAr}
              </p>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between bg-gradient-to-r from-navy/6 to-transparent rounded-xl p-4 border border-navy/10">
        <span className="font-bold text-navy/65">المستحق عند توصيلك:</span>
        <span className="font-black text-gold text-2xl tabular-nums">
          {price} <span className="text-lg">ر.س</span>
        </span>
      </div>

      <button type="button" onClick={handleBuy} className="btn-gold w-full text-xl py-5 md:py-5">
        إضافة للسلة — الدفع عند الاستلام
      </button>

      <div className="flex flex-wrap justify-center gap-2 md:gap-3 text-[11px] md:text-xs text-navy/55 font-bold">
        <span className="rounded-full bg-navy/[0.05] px-3 py-1 border border-navy/10">
          ☎ تأكيد هاتفي قبل الشحن
        </span>
        <span className="rounded-full bg-navy/[0.05] px-3 py-1 border border-navy/10">
          🛡️ ضمان ذهبي ٣٠ يوم
        </span>
      </div>
    </div>
  );
}
