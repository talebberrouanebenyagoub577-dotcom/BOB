"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { PRICE_TIERS } from "@/data/products";
import { useCartStore } from "@/lib/store";
import { trackAddToCart } from "@/lib/pixels";

interface Props {
  product: Product;
}

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-gold text-sm">★</span>
      ))}
    </div>
  );
}

export function ProductCard({ product }: Props) {
  const { addItem, openDrawer } = useCartStore();

  const handleBuy = () => {
    addItem(product, 1);
    trackAddToCart(product.id, product.price);
    openDrawer();
  };

  return (
    <article className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative">
        <Link href={`/products/${product.id}`} className="block aspect-square bg-navy/10 relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.nameAr}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </Link>
        {product.badge && (
          <span className="absolute top-3 right-3 bg-gold text-white text-xs font-bold px-2 py-1 rounded-lg">
            {product.badge}
          </span>
        )}
        {product.stock <= 10 && (
          <span className="absolute top-3 left-3 bg-navy text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
            {product.stock} قطع فقط
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Stars + review count */}
        <div className="flex items-center gap-2">
          <Stars count={product.rating} />
          <span className="text-xs text-navy/50">({product.reviewCount})</span>
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-navy text-lg leading-snug hover:text-gold transition-colors">
            {product.nameAr}
          </h3>
        </Link>

        <p className="text-sm text-navy/60">{product.shortBenefit}</p>

        {/* Price tiers */}
        <div className="space-y-1">
          {PRICE_TIERS.map((tier) => (
            <div
              key={tier.qty}
              className={`flex justify-between items-center text-sm px-3 py-1.5 rounded-lg ${
                tier.qty === 3
                  ? "bg-gold/10 border border-gold/30"
                  : "bg-navy/5"
              }`}
            >
              <span className="text-navy/70 font-medium">
                {tier.qty === 1 ? "قطعة واحدة" : tier.qty === 2 ? "قطعتان" : "٣ قطع ⭐"}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-navy">{tier.price} ر.س</span>
                {tier.saveAr && (
                  <span className="text-xs text-gold font-bold">{tier.saveAr}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stock warning */}
        <p className="text-xs text-navy/50 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full inline-block" />
          تبقّى {product.stock} قطع فقط هذا الأسبوع
        </p>

        {/* CTAs */}
        <div className="flex gap-2 mt-auto">
          <button onClick={handleBuy} className="btn-gold flex-1">
            اشتري الآن
          </button>
          <Link
            href={`/products/${product.id}`}
            className="border border-navy/20 text-navy font-bold rounded-xl py-3 px-4 text-sm hover:bg-navy/5 transition-colors"
          >
            تفاصيل
          </Link>
        </div>
      </div>
    </article>
  );
}
