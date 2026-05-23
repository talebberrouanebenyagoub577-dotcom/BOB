"use client";

import type { Product } from "@/types";
import { PdpQtyProvider } from "@/components/pdp/PdpQtyContext";
import { PdpStickyBuyBar } from "@/components/pdp/PdpStickyBuyBar";

export function ProductPdpShell({
  product,
  children,
}: {
  product: Product;
  children: React.ReactNode;
}) {
  return (
    <PdpQtyProvider product={product}>
      <div className="pb-[4.75rem] sm:pb-20">{children}</div>
      <PdpStickyBuyBar />
    </PdpQtyProvider>
  );
}
