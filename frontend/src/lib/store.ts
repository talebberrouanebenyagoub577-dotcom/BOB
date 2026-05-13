import { create } from "zustand";
import type { CartItem, Product } from "@/types";
import { getTierPrice } from "@/data/products";

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  isCheckoutOpen: boolean;
  isUpsellOpen: boolean;
  upsellShownThisSession: boolean;

  addItem: (product: Product, qty: number) => void;
  removeItem: (sku: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openUpsell: () => void;
  closeUpsell: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isDrawerOpen: false,
  isCheckoutOpen: false,
  isUpsellOpen: false,
  upsellShownThisSession: false,

  addItem: (product, qty) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.sku === product.sku);
      if (existing) {
        const newQty = existing.qty + qty;
        return {
          items: state.items.map((i) =>
            i.product.sku === product.sku
              ? { ...i, qty: newQty, price: getTierPrice(newQty) }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { product, qty, price: getTierPrice(qty) },
        ],
      };
    });
  },

  removeItem: (sku) =>
    set((state) => ({ items: state.items.filter((i) => i.product.sku !== sku) })),

  clearCart: () => set({ items: [] }),

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  openCheckout: () => set({ isCheckoutOpen: true, isDrawerOpen: false }),
  closeCheckout: () => set({ isCheckoutOpen: false }),
  openUpsell: () =>
    set({ isUpsellOpen: true, upsellShownThisSession: true }),
  closeUpsell: () => set({ isUpsellOpen: false }),

  total: () => get().items.reduce((sum, i) => sum + i.price, 0),
}));
