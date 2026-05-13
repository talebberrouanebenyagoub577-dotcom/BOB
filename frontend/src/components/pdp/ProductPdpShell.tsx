"use client";

import type { Product } from "@/types";
import { PdpQtyProvider } from "@/components/pdp/PdpQtyContext";
import {
  PdpStickyCommerceBar,
  useShowStickyWhenBuyNotVisible,
} from "@/components/pdp/PdpStickyCommerceBar";

export function ProductPdpShell({
  product,
  children,
}: {
  product: Product;
  children: React.ReactNode;
}) {
  const showSticky = useShowStickyWhenBuyNotVisible(true);

  return (
    <PdpQtyProvider product={product}>
      <div className="pb-[5.75rem] md:pb-[5.25rem]">{children}</div>
      <PdpStickyCommerceBar showWhenBuyHidden={showSticky} />
    </PdpQtyProvider>
  );
}
