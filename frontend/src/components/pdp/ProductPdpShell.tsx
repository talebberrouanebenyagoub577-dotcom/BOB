"use client";

import type { Product } from "@/types";
import { PdpQtyProvider } from "@/components/pdp/PdpQtyContext";

export function ProductPdpShell({
  product,
  children,
}: {
  product: Product;
  children: React.ReactNode;
}) {
  return <PdpQtyProvider product={product}>{children}</PdpQtyProvider>;
}
