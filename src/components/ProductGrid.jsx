import { PRODUCTS } from "../data/products";
import { useCart } from "../store/cartStore";

export default function ProductGrid() {
  const { buyNow } = useCart();

  return (
    <section id="shop" className="product-section">
      <h2>منتجات أساسية للقيادة اليومية</h2>
      <div className="product-grid">
        {PRODUCTS.map((product) => (
          <article key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.shortBenefit}</p>
            <div className="product-footer">
              <strong>{product.price} SAR</strong>
              <button
                type="button"
                onClick={() => buyNow(product.id)}
                className="primary-btn"
              >
                اطلب الآن - الدفع عند الاستلام
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
