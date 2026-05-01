"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { PRICE_TIERS } from "@/data/products";
import { useCartStore } from "@/lib/store";
import { trackAddToCart } from "@/lib/pixels";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { addItem, openDrawer } = useCartStore();

  const handleBuy = () => {
    addItem(product, 1);
    trackAddToCart(product.id, product.price);
    openDrawer();
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="block aspect-square bg-gray-100 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl select-none">
          🛍️
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-navy text-lg leading-snug hover:text-gold transition-colors">
            {product.nameAr}
          </h3>
        </Link>

        {/* Tier prices */}
        <div className="flex gap-2 flex-wrap">
          {PRICE_TIERS.map((tier) => (
            <span
              key={tier.qty}
              className="text-xs bg-navy/5 text-navy/70 rounded-lg px-2 py-1 font-medium"
            >
              {tier.qty} قطعة — {tier.price} ر.س
            </span>
          ))}
        </div>

        <p className="text-2xl font-extrabold text-gold mt-auto">
          {product.price} <span className="text-base font-bold">ر.س</span>
        </p>

        <button onClick={handleBuy} className="btn-gold w-full mt-1">
          اشتري الآن
        </button>
      </div>
    </div>
  );
}
