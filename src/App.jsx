import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { CartProvider, useCart } from "./store/cartStore";
import { PRODUCTS } from "./data/products";
import { getUpsellPrice } from "./lib/pricing";
import { submitFinalOrder } from "./lib/orderApi";

import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import CheckoutPopup from "./components/CheckoutPopup";
import UpsellOfferModal from "./components/UpsellOfferModal";
import ThankYouPage from "./components/ThankYouPage";

import AdminDashboardPage from "./pages/AdminDashboard";
import HomePage from "./pages/HomePage";
import CollectionPage from "./pages/CollectionPage";
import ProductPage from "./pages/ProductPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PolicyPage from "./pages/policies/PolicyPage";

const UPSELL_KEY = "nm_upsell_seen";

function getUpsellCandidate(orderItems) {
  const inCart = new Set(orderItems.map((i) => i.id));
  return PRODUCTS.find((p) => !inCart.has(p.id)) ?? null;
}

function createOrderId() {
  const uuid =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36);
  return `NM-${uuid.slice(0, 8).toUpperCase()}`;
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Storefront() {
  const { clearCart, closeCheckout, closeDrawer } = useCart();
  const upsellPrice = getUpsellPrice();

  const [checkoutPayload, setCheckoutPayload] = useState(null);
  const [upsellOffer, setUpsellOffer]         = useState(null);
  const [isUpsellOpen, setIsUpsellOpen]       = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [submitError, setSubmitError]         = useState("");
  const [finalOrder, setFinalOrder]           = useState(null);

  const [upsellSeen] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem(UPSELL_KEY) === "1"
  );

  const completeOrder = async ({ acceptedUpsell }) => {
    if (!checkoutPayload || isSubmitting) return;

    const upsellAccepted = Boolean(acceptedUpsell && upsellOffer);
    const total = checkoutPayload.total + (upsellAccepted ? upsellPrice : 0);

    const finalItems = checkoutPayload.items.map((item) => ({
      id: item.id, sku: item.sku, name: item.name,
      qty: item.quantity, unit_price: item.price,
    }));
    if (upsellAccepted && upsellOffer) {
      finalItems.push({
        id: upsellOffer.id, sku: upsellOffer.sku, name: upsellOffer.name,
        qty: 1, unit_price: upsellPrice,
      });
    }

    const payload = {
      order_id: checkoutPayload.orderId,
      created_at: new Date().toISOString(),
      customer_name: checkoutPayload.customerName,
      phone: checkoutPayload.phone,
      items: finalItems,
      upsell_offered: Boolean(upsellOffer),
      upsell_product: upsellOffer ? { id: upsellOffer.id, sku: upsellOffer.sku, name: upsellOffer.name } : null,
      upsell_accepted: upsellAccepted,
      upsell_price: upsellAccepted ? upsellPrice : 0,
      total,
      source_page: window.location.pathname,
      idempotency_key: checkoutPayload.orderId,
    };

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await submitFinalOrder(payload);
      setFinalOrder({
        orderId: checkoutPayload.orderId,
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
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderConfirmed = ({ customerName, phone, items, total }) => {
    const orderId = createOrderId();
    setCheckoutPayload({ orderId, customerName, phone, items, total });
    setSubmitError("");

    const candidate = getUpsellCandidate(items);
    if (candidate && !upsellSeen) {
      localStorage.setItem(UPSELL_KEY, "1");
      closeCheckout();
      closeDrawer();
      setUpsellOffer(candidate);
      setIsUpsellOpen(true);
      return;
    }
    completeOrder({ acceptedUpsell: false });
  };

  if (finalOrder) {
    return (
      <>
        <Header />
        <ThankYouPage order={finalOrder} onContinueShopping={() => setFinalOrder(null)} />
        <Footer />
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/"                   element={<HomePage />} />
        <Route path="/collection"         element={<CollectionPage />} />
        <Route path="/products"           element={<Navigate to="/collection" replace />} />
        <Route path="/products/:id"       element={<ProductPage />} />
        <Route path="/about"              element={<AboutPage />} />
        <Route path="/contact"            element={<ContactPage />} />
        <Route path="/policies/:slug"     element={<PolicyPage />} />
        <Route path="*"                   element={<HomePage />} />
      </Routes>
      <Footer />

      {/* Global overlays */}
      <CartDrawer />
      <CheckoutPopup onOrderConfirmed={handleOrderConfirmed} />
      <UpsellOfferModal
        isOpen={isUpsellOpen}
        offerProduct={upsellOffer}
        countdownSeconds={12}
        onAccept={() => { setIsUpsellOpen(false); completeOrder({ acceptedUpsell: true }); }}
        onReject={() => { setIsUpsellOpen(false); completeOrder({ acceptedUpsell: false }); }}
      />

      {isSubmitting && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 400,
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "28px 32px",
            textAlign: "center", fontFamily: "var(--font)",
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>جاري إرسال طلبك...</p>
            <p style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 6 }}>لحظة من فضلك</p>
          </div>
        </div>
      )}

      {submitError && (
        <div style={{
          position: "fixed", bottom: 20, right: 20, left: 20,
          background: "var(--red)", color: "#fff",
          borderRadius: 12, padding: "14px 18px",
          fontFamily: "var(--font)", fontWeight: 600, fontSize: 14,
          zIndex: 400, textAlign: "center",
        }}>
          ⚠️ {submitError}
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* /admin/* so /admin/ with trailing slash still hits the dashboard (else /* can show storefront). */}
        <Route path="/admin/*" element={<AdminDashboardPage />} />
        <Route
          path="/*"
          element={
            <CartProvider>
              <Storefront />
            </CartProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
