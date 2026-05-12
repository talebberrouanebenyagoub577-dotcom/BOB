import { useCart } from "../store/cartStore";
import { getBundleTotalByUnits } from "../lib/pricing";

function TierInfo({ itemCount }) {
  if (itemCount === 0) return null;
  if (itemCount === 1) return <p className="tier-info">أضف قطعة ثانية وفّر 119 ر.س!</p>;
  if (itemCount === 2) return <p className="tier-info">أضف قطعة ثالثة وفّر 248 ر.س إجمالاً!</p>;
  return <p className="tier-info" style={{ background: "var(--green-light)", color: "#166534" }}>✓ حصلت على أفضل سعر!</p>;
}

export default function CartDrawer() {
  const {
    isDrawerOpen, isCheckoutOpen, closeDrawer, openCheckout,
    cartItems, crossSellProducts, subtotal, checkoutTotal,
    addToCart, incrementItem, decrementItem, removeItem,
    itemCount,
  } = useCart();

  const drawerVisible = isDrawerOpen && !isCheckoutOpen;

  return (
    <>
      <div
        className={`overlay ${drawerVisible ? "visible" : ""}`}
        onClick={closeDrawer}
        aria-hidden={!drawerVisible}
      />
      <aside className={`drawer ${drawerVisible ? "open" : ""}`} aria-label="سلة التسوق">
        {/* Header */}
        <div className="drawer-header">
          <h2>
            سلة التسوق
            {itemCount > 0 && (
              <span style={{ marginRight: 8, fontSize: 14, fontWeight: 600, color: "var(--gray-400)" }}>
                ({itemCount} قطعة)
              </span>
            )}
          </h2>
          <button className="close-btn" onClick={closeDrawer} type="button" aria-label="إغلاق السلة">✕</button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>سلتك فارغة</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>أضف منتجاً لبدء طلبك</p>
            </div>
          ) : (
            <>
              {/* Items */}
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    className="cart-item-img"
                    src={item.image}
                    alt={item.name}
                  />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">199 ر.س / قطعة</div>
                    <div className="cart-item-controls">
                      <button className="qty-btn" onClick={() => decrementItem(item.id)} type="button">−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => incrementItem(item.id)} type="button">+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeItem(item.id)} type="button">
                      حذف ✕
                    </button>
                  </div>
                  <div style={{ fontWeight: 800, color: "var(--navy)", fontSize: 16, whiteSpace: "nowrap" }}>
                    {item.lineTotal} ر.س
                  </div>
                </div>
              ))}

              {/* Tier info nudge */}
              <TierInfo itemCount={itemCount} />

              {/* Cross-sell */}
              {crossSellProducts.length > 0 && (
                <div className="drawer-cross-sell">
                  <p className="cross-sell-title">🎯 يُطلب معه غالباً</p>
                  <div className="cross-sell-cards">
                    {crossSellProducts.map((p) => (
                      <div key={p.id} className="cross-sell-card">
                        <img className="cross-sell-img" src={p.image} alt={p.name} />
                        <div className="cross-sell-info">
                          <div className="cross-sell-name">{p.name}</div>
                          <div className="cross-sell-benefit">{p.shortBenefit}</div>
                          <div className="cross-sell-price">199 ر.س</div>
                        </div>
                        <button className="add-btn" onClick={() => addToCart(p.id)} type="button">
                          أضف
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="price-summary">
              {subtotal !== checkoutTotal && (
                <div className="price-row">
                  <span className="price-label">السعر الأصلي</span>
                  <span className="price-value" style={{ textDecoration: "line-through", color: "var(--gray-400)" }}>
                    {subtotal} ر.س
                  </span>
                </div>
              )}
              <div className="price-row total">
                <span className="price-label">الإجمالي</span>
                <span className="price-value">{checkoutTotal} ر.س</span>
              </div>
            </div>

            {subtotal !== checkoutTotal && (
              <div style={{ textAlign: "center", fontSize: 13, color: "var(--green)", fontWeight: 700, background: "var(--green-light)", padding: "6px 12px", borderRadius: 8 }}>
                🎉 وفّرت {subtotal - checkoutTotal} ر.س بسبب العرض!
              </div>
            )}

            <button
              type="button"
              className="btn btn-gold btn-full btn-lg"
              onClick={openCheckout}
            >
              إتمام الطلب — {checkoutTotal} ر.س ←
            </button>
            <div style={{ textAlign: "center", fontSize: 12, color: "var(--green)", fontWeight: 600 }}>
              ✓ الدفع عند الاستلام — بدون بطاقة
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
