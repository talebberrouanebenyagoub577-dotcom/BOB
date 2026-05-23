import { create } from "zustand";
import type { CartItem, Product } from "@/types";
import { getTierPrice } from "@/data/products";

interface CartState {
  items: CartItem[];
  isCheckoutOpen: boolean;
  isUpsellOpen: boolean;
  upsellShownThisSession: boolean;

  addItem: (product: Product, qty: number) => void;
  clearCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openUpsell: () => void;
  closeUpsell: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isCheckoutOpen: false,
  isUpsellOpen: false,
  upsellShownThisSession: false,

  addItem: (product, qty) => {
    set({
      items: [{ product, qty, price: getTierPrice(qty) }],
    });
  },

  clearCart: () => set({ items: [] }),

  openCheckout: () => set({ isCheckoutOpen: true }),
  closeCheckout: () => set({ isCheckoutOpen: false }),
  openUpsell: () =>
    set({ isUpsellOpen: true, upsellShownThisSession: true }),
  closeUpsell: () => set({ isUpsellOpen: false }),

  total: () => get().items.reduce((sum, i) => sum + i.price, 0),
}));
