import CartDrawer from "./components/CartDrawer";
import CheckoutPopup from "./components/CheckoutPopup";
import Header from "./components/Header";
import ProductGrid from "./components/ProductGrid";
import ThankYouPage from "./components/ThankYouPage";
import UpsellOfferModal from "./components/UpsellOfferModal";
import { getActiveCopyVariant } from "./content/copyByVariant";
import { PRODUCTS } from "./data/products";
import { submitFinalOrder } from "./lib/orderApi";
import { getUpsellPrice } from "./lib/pricing";
import { useState } from "react";
import { CartProvider, useCart } from "./store/cartStore";

const UPSELL_STORAGE_KEY = "nidhamauto_upsell_seen";

function getUpsellCandidate(orderItems) {
  const inCartIds = new Set(orderItems.map((item) => item.id));
  return PRODUCTS.find((product) => !inCartIds.has(product.id)) ?? null;
}

function createOrderId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `NA-${crypto.randomUUID()}`;
  }
  return `NA-${Date.now()}`;
}

function Storefront() {
  const { clearCart } = useCart();
  const upsellPrice = getUpsellPrice();
  const copyVariant = getActiveCopyVariant();
  const [checkoutPayload, setCheckoutPayload] = useState(null);
  const [upsellOffer, setUpsellOffer] = useState(null);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [finalOrder, setFinalOrder] = useState(null);
  const [upsellAlreadyShown, setUpsellAlreadyShown] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(UPSELL_STORAGE_KEY) === "1";
  });

  const completeOrder = async ({ acceptedUpsell }) => {
    if (!checkoutPayload || isSubmittingOrder) return;

    const upsellAccepted = Boolean(acceptedUpsell && upsellOffer);
    const total = checkoutPayload.total + (upsellAccepted ? upsellPrice : 0);
    const finalItems = [
      ...checkoutPayload.items.map((item) => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        qty: item.quantity,
        unit_price: item.price,
      })),
    ];
    if (upsellAccepted && upsellOffer) {
      finalItems.push({
        id: upsellOffer.id,
        sku: upsellOffer.sku,
        name: upsellOffer.name,
        qty: 1,
        unit_price: upsellPrice,
      });
    }

    const orderPayload = {
      order_id: checkoutPayload.orderId,
      created_at: new Date().toISOString(),
      customer_name: checkoutPayload.customerName,
      phone: checkoutPayload.phone,
      items: finalItems,
      upsell_offered: Boolean(upsellOffer),
      upsell_product: upsellOffer
        ? {
            id: upsellOffer.id,
            sku: upsellOffer.sku,
            name: upsellOffer.name,
          }
        : null,
      upsell_accepted: upsellAccepted,
      upsell_price: upsellAccepted ? upsellPrice : 0,
      total,
      source_page: "storefront",
      idempotency_key: checkoutPayload.orderId,
      copy_variant: copyVariant,
    };

    setIsSubmittingOrder(true);
    setSubmitError("");
    try {
      await submitFinalOrder(orderPayload);
      setFinalOrder({
        orderId: checkoutPayload.orderId,
        copyVariant,
        customerName: checkoutPayload.customerName,
        phone: checkoutPayload.phone,
        items: checkoutPayload.items,
        upsellAccepted,
        upsellProduct: upsellAccepted ? upsellOffer : null,
        upsellPrice: upsellAccepted ? upsellPrice : 0,
        total,
      });
      clearCart();
      setCheckoutPayload(null);
      setUpsellOffer(null);
      setIsUpsellOpen(false);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleOrderConfirmed = ({ customerName, phone, items, total }) => {
    const payload = { orderId: createOrderId(), customerName, phone, items, total };
    setCheckoutPayload(payload);
    setSubmitError("");

    const candidate = getUpsellCandidate(items);
    if (candidate && !upsellAlreadyShown) {
      window.localStorage.setItem(UPSELL_STORAGE_KEY, "1");
      setUpsellAlreadyShown(true);
      setUpsellOffer(candidate);
      setIsUpsellOpen(true);
      return;
    }

    completeOrder({ acceptedUpsell: false });
  };

  const handleUpsellAccept = () => {
    setIsUpsellOpen(false);
    completeOrder({ acceptedUpsell: true });
  };

  const handleUpsellReject = () => {
    setIsUpsellOpen(false);
    completeOrder({ acceptedUpsell: false });
  };

  if (finalOrder) {
    return <ThankYouPage order={finalOrder} />;
  }

  return (
    <div className="app">
      <Header />
      <main id="home">
        <section className="hero">
          <h1>نظّم قيادتك وخل يومك أهدأ</h1>
          <p>
            متجر سعودي متخصص في حلول قيادة عملية مع الدفع عند الاستلام لكل مناطق
            المملكة.
          </p>
        </section>
        <ProductGrid />
        {isSubmittingOrder && (
          <p className="upsell-placeholder">جاري إرسال طلبك... لحظة من فضلك.</p>
        )}
        {submitError && <p className="field-error">{submitError}</p>}
      </main>
      <CartDrawer />
      <CheckoutPopup onOrderConfirmed={handleOrderConfirmed} />
      <UpsellOfferModal
        isOpen={isUpsellOpen}
        offerProduct={upsellOffer}
        countdownSeconds={12}
        onAccept={handleUpsellAccept}
        onReject={handleUpsellReject}
      />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Storefront />
    </CartProvider>
  );
}
