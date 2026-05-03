export type ProductId =
  | "seat-organizer"
  | "seatgap-protector"
  | "parking-mirror";

export interface Product {
  id: ProductId;
  sku: string;
  nameAr: string;
  shortAr: string;
  shortBenefit: string;
  descriptionAr: string;
  price: number; // base (1 unit)
  image: string;
  benefits: string[];
  badge?: string;
  reviewCount: number;
  rating: number;
  stock: number;
}

export interface PriceTier {
  qty: number;
  price: number;
  saveAr?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
  price: number; // tier price for this qty
}

export interface OrderPayload {
  name: string;
  phone: string; // 05XXXXXXXX
  items: { sku: string; qty: number; unit_price: number }[];
  total: number;
  upsell_accepted: boolean;
  upsell_sku?: string;
  event_id: string;
}

export interface OrderResponse {
  order_id: string;
  order_number: string;
}
