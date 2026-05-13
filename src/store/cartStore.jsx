import { createContext, useContext, useMemo, useReducer } from "react";
import { CROSS_SELL_MAP, PRODUCTS } from "../data/products";
import { getBundleTotalByUnits } from "../lib/pricing";

const productsById = PRODUCTS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

const CartContext = createContext(null);

const initialState = {
  isDrawerOpen: false,
  isCheckoutOpen: false,
  items: {},
};

function cartReducer(state, action) {
  switch (action.type) {
    case "OPEN_DRAWER":
      return { ...state, isDrawerOpen: true };
    case "CLOSE_DRAWER":
      return { ...state, isDrawerOpen: false };
    case "TOGGLE_DRAWER":
      return { ...state, isDrawerOpen: !state.isDrawerOpen };
    case "OPEN_CHECKOUT":
      return { ...state, isCheckoutOpen: true, isDrawerOpen: false };
    case "CLOSE_CHECKOUT":
      return { ...state, isCheckoutOpen: false };
    case "ADD_ITEM": {
      const currentQty = state.items[action.productId] ?? 0;
      return {
        ...state,
        isDrawerOpen: false,
        isCheckoutOpen: true,
        items: {
          ...state.items,
          [action.productId]: currentQty + (action.quantity ?? 1),
        },
      };
    }
    case "INCREMENT_ITEM": {
      const currentQty = state.items[action.productId] ?? 0;
      if (currentQty === 0) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [action.productId]: currentQty + 1,
        },
      };
    }
    case "DECREMENT_ITEM": {
      const currentQty = state.items[action.productId] ?? 0;
      if (currentQty <= 1) {
        const updatedItems = { ...state.items };
        delete updatedItems[action.productId];
        return { ...state, items: updatedItems };
      }
      return {
        ...state,
        items: {
          ...state.items,
          [action.productId]: currentQty - 1,
        },
      };
    }
    case "REMOVE_ITEM": {
      if (!state.items[action.productId]) return state;
      const updatedItems = { ...state.items };
      delete updatedItems[action.productId];
      return { ...state, items: updatedItems };
    }
    case "CLEAR_CART":
      return { ...state, items: {}, isDrawerOpen: false, isCheckoutOpen: false };
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

function getCrossSellProducts(itemsMap) {
  const cartProductIds = Object.keys(itemsMap);
  const suggestions = new Set();

  cartProductIds.forEach((productId) => {
    (CROSS_SELL_MAP[productId] ?? []).forEach((suggestionId) => {
      if (!itemsMap[suggestionId]) suggestions.add(suggestionId);
    });
  });

  return Array.from(suggestions)
    .slice(0, 2)
    .map((productId) => productsById[productId]);
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const value = useMemo(() => {
    const cartItems = getCartItems(state.items);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const checkoutTotal = getBundleTotalByUnits(itemCount);
    const crossSellProducts = getCrossSellProducts(state.items);

    return {
      isDrawerOpen: state.isDrawerOpen,
      isCheckoutOpen: state.isCheckoutOpen,
      cartItems,
      itemCount,
      subtotal,
      checkoutTotal,
      crossSellProducts,
      addToCart: (productId, quantity = 1) =>
        dispatch({ type: "ADD_ITEM", productId, quantity }),
      incrementItem: (productId) => dispatch({ type: "INCREMENT_ITEM", productId }),
      decrementItem: (productId) => dispatch({ type: "DECREMENT_ITEM", productId }),
      removeItem: (productId) => dispatch({ type: "REMOVE_ITEM", productId }),
      openDrawer: () => dispatch({ type: "OPEN_DRAWER" }),
      closeDrawer: () => dispatch({ type: "CLOSE_DRAWER" }),
      toggleDrawer: () => dispatch({ type: "TOGGLE_DRAWER" }),
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
