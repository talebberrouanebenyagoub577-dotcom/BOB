import { getProductBasePrice } from "../lib/pricing";

export const PRODUCTS = [
  {
    id: "phone-mount",
    sku: "NA-PM-001",
    name: "Magnetic Stability Mount",
    shortBenefit: "Zero-drop navigation support for daily commutes.",
    price: getProductBasePrice("phone-mount"),
    image: "https://placehold.co/240x160?text=Phone+Mount",
  },
  {
    id: "seatgap-organizer",
    sku: "NA-SG-001",
    name: "SeatGap Shield Organizer",
    shortBenefit: "Stops daily item loss between seats instantly.",
    price: getProductBasePrice("seatgap-organizer"),
    image: "https://placehold.co/240x160?text=SeatGap+Organizer",
  },
  {
    id: "parking-mirror-kit",
    sku: "NA-PK-001",
    name: "Precision View Mirror Kit",
    shortBenefit: "Improves parking confidence in tight city spots.",
    price: getProductBasePrice("parking-mirror-kit"),
    image: "https://placehold.co/240x160?text=Parking+Mirror+Kit",
  },
];

export const CROSS_SELL_MAP = {
  "phone-mount": ["seatgap-organizer", "parking-mirror-kit"],
  "seatgap-organizer": ["phone-mount", "parking-mirror-kit"],
  "parking-mirror-kit": ["phone-mount", "seatgap-organizer"],
};
