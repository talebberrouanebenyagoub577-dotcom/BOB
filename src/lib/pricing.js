import { PRICING_CONFIG } from "../config/pricing";

export function getProductBasePrice(productId) {
  return PRICING_CONFIG.products[productId] ?? 0;
}

export function getUpsellPrice() {
  return PRICING_CONFIG.upsell.price;
}

export function getBundleTotalByUnits(unitCount) {
  if (unitCount <= 0) return 0;

  let remaining = unitCount;
  let total = 0;
  const tiers = [...PRICING_CONFIG.bundleTiers].sort((a, b) => b.units - a.units);

  tiers.forEach((tier) => {
    if (remaining <= 0) return;
    const count = Math.floor(remaining / tier.units);
    if (count > 0) {
      total += count * tier.price;
      remaining -= count * tier.units;
    }
  });

  return total;
}
