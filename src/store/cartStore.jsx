import { createContext, useContext, useMemo, useReducer } from "react";
import { PRODUCTS } from "../data/products";
import { getBundleTotalByUnits } from "../lib/pricing";

const productsById = PRODUCTS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

const CartContext = createContext(null);

const initialState = {
  isCheckoutOpen: false,
  items: {},
};

function cartReducer(state, action) {
  switch (action.type) {
    case "OPEN_CHECKOUT":
      return { ...state, isCheckoutOpen: true };
    case "CLOSE_CHECKOUT":
      return { ...state, isCheckoutOpen: false };
    case "ADD_ITEM": {
      const qty = action.quantity ?? 1;
      return {
        ...state,
        isCheckoutOpen: true,
        items: {
          [action.productId]: qty,
        },
      };
    }
    case "CLEAR_CART":
      return { ...state, items: {}, isCheckoutOpen: false };
    default:
      return state;
  }
}

function getCartItems(itemsMap) {
  return Object.entries(itemsMap).map(([productId, quantity]) => ({
    ...productsById[productId],
    quantity,
    lineTotal: productsById[productId].price * quantity,
  }));
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const value = useMemo(() => {
    const cartItems = getCartItems(state.items);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const checkoutTotal = getBundleTotalByUnits(itemCount);

    return {
      isCheckoutOpen: state.isCheckoutOpen,
      cartItems,
      itemCount,
      subtotal,
      checkoutTotal,
      buyNow: (productId, quantity = 1) =>
        dispatch({ type: "ADD_ITEM", productId, quantity }),
      openCheckout: () => dispatch({ type: "OPEN_CHECKOUT" }),
      closeCheckout: () => dispatch({ type: "CLOSE_CHECKOUT" }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
