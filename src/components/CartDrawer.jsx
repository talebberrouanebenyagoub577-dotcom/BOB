import { useCart } from "../store/cartStore";

export default function CartDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    openCheckout,
    cartItems,
    crossSellProducts,
    subtotal,
    checkoutTotal,
    addToCart,
    incrementItem,
    decrementItem,
    removeItem,
  } = useCart();

  return (
    <>
      <div
        className={`overlay ${isDrawerOpen ? "visible" : ""}`}
        onClick={closeDrawer}
        aria-hidden={!isDrawerOpen}
      />
      <aside className={`drawer ${isDrawerOpen ? "open" : ""}`} aria-live="polite">
        <div className="drawer-header">
          <h2>السلة</h2>
          <button type="button" onClick={closeDrawer} className="ghost-btn">
            إغلاق
          </button>
        </div>

        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <p className="muted">سلتك فارغة. أضف منتجًا لبدء الطلب.</p>
          ) : (
            <ul className="cart-list">
              {cartItems.map((item) => (
                <li key={item.id} className="cart-item">
                  <div>
                    <h4>{item.name}</h4>
                    <small>{item.price} SAR each</small>
                  </div>
                  <div className="item-controls">
                    <button onClick={() => decrementItem(item.id)} type="button">
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => incrementItem(item.id)} type="button">
                      +
                    </button>
                  </div>
                  <div className="line-total">{item.lineTotal} SAR</div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    حذف
                  </button>
                </li>
              ))}
            </ul>
          )}

          {cartItems.length > 0 && (
            <section className="cross-sell">
              <h3>منتجات تُطلب معًا غالبًا</h3>
              {crossSellProducts.length === 0 ? (
                <p className="muted">أضفت كل المنتجات المقترحة.</p>
              ) : (
                <div className="cross-sell-list">
                  {crossSellProducts.map((product) => (
                    <article key={product.id} className="cross-sell-item">
                      <div>
                        <strong>{product.name}</strong>
                        <p>{product.shortBenefit}</p>
                        <small>{product.price} SAR</small>
                      </div>
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => addToCart(product.id)}
                      >
                        إضافة
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <div className="drawer-footer">
          <div className="subtotal">
            <span>المجموع الأساسي</span>
            <strong>{subtotal} SAR</strong>
          </div>
          <div className="subtotal">
            <span>الإجمالي بعد العروض</span>
            <strong>{checkoutTotal} SAR</strong>
          </div>
          <button
            type="button"
            className="primary-btn"
            disabled={cartItems.length === 0}
            onClick={openCheckout}
          >
            الانتقال لتأكيد الطلب
          </button>
        </div>
      </aside>
    </>
  );
}
