"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/types";

type Ctx = {
  product: Product;
  qty: number;
  setQty: (n: number) => void;
};

const PdpQtyContext = createContext<Ctx | null>(null);

export function PdpQtyProvider({
  product,
  children,
}: {
  product: Product;
  children: ReactNode;
}) {
  const [qty, setQtyState] = useState(1);
  const setQty = useCallback((n: number) => setQtyState(n), []);

  const value = useMemo(
    () => ({ product, qty, setQty }),
    [product, qty, setQty]
  );

  return (
    <PdpQtyContext.Provider value={value}>{children}</PdpQtyContext.Provider>
  );
}

export function useOptionalPdpQty(): Ctx | null {
  return useContext(PdpQtyContext);
}

export function usePdpQty(): Ctx {
  const c = useContext(PdpQtyContext);
  if (!c) throw new Error("usePdpQty تحت PdpQtyProvider فقط.");
  return c;
}
