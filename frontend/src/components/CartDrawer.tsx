"use client";

import { useCartStore } from "@/lib/store";
import { PRODUCTS } from "@/data/products";
import { trackInitiateCheckout } from "@/lib/pixels";
import { trackServerEvent } from "@/lib/serverTrack";
import clsx from "clsx";

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    openCheckout,
    removeItem,
    total,
  } = useCartStore();

  const cartSkus = new Set(items.map((i) => i.product.sku));
  const crossSell = PRODUCTS.filter((p) => !cartSkus.has(p.sku)).slice(0, 2);

  const handleCheckout = () => {
    trackInitiateCheckout(total());
    trackServerEvent("initiate_checkout", { value: total() });
    openCheckout();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 z-[70] transition-opacity duration-300",
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeDrawer}
      />

      {/* Drawer — slides from RIGHT (RTL) */}
      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300",
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-navy/10">
          <h2 className="font-extrabold text-navy text-xl">سلة التسوق</h2>
          <button
            onClick={closeDrawer}
            aria-label="إغلاق"
            className="w-9 h-9 rounded-full bg-navy/5 flex items-center justify-center hover:bg-navy/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-navy/40 mt-12 font-medium">
              سلتك فارغة
            </p>
          ) : (
            items.map((item) => (
                <div
                  key={item.product.sku}
                  className="flex items-center gap-3 bg-navy/5 rounded-xl p-3"
                >
                  <div className="w-16 h-16 sm:w-[4.25rem] sm:h-[4.25rem] rounded-xl bg-white border border-navy/10 flex-shrink-0 overflow-hidden flex items-center justify-center p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.image}
                      alt=""
                      className="max-w-full max-h-full w-auto h-auto object-contain object-center"
                    />
                  </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-navy text-sm leading-snug truncate">
                    {item.product.nameAr}
                  </p>
                  <p className="text-navy/60 text-xs mt-0.5">
                    {item.qty} × {Math.round(item.price / item.qty)} ر.س
                  </p>
                  <p className="font-extrabold text-gold text-sm">
                    {item.price} ر.س
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.product.sku)}
                  className="text-navy/30 hover:text-red-500 transition-colors text-lg"
                  aria-label="حذف"
                >
                  ×
                </button>
              </div>
            ))
          )}

          {/* Cross-sell */}
          {items.length > 0 && crossSell.length > 0 && (
            <div className="mt-4">
              <p className="font-bold text-navy text-sm mb-3">قد يعجبكِ أيضاً</p>
              <div className="space-y-2">
                {crossSell.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 border border-navy/10 rounded-xl p-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                      🛍️
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-navy text-xs leading-snug">
                        {p.nameAr}
                      </p>
                      <p className="text-gold font-bold text-sm">{p.price} ر.س</p>
                    </div>
                    <button
                      onClick={() => {
                        useCartStore.getState().addItem(p, 1);
                        trackServerEvent("add_to_cart", {
                          sku: p.sku,
                          productId: p.id,
                          source: "cart_cross_sell",
                        });
                      }}
                      className="text-xs bg-navy text-white font-bold rounded-lg px-2 py-1.5 hover:bg-navy/80 transition-colors"
                    >
                      أضف
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-navy/10 space-y-3">
            <div className="flex justify-between items-center font-extrabold text-navy text-lg">
              <span>الإجمالي</span>
              <span className="text-gold">{total()} ر.س</span>
            </div>
            <button onClick={handleCheckout} className="btn-gold w-full text-lg py-4">
              إتمام الطلب
            </button>
          </div>
        )}
      </div>
    </>
  );
}
