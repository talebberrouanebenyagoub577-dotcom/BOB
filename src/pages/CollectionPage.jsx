import { Link } from "react-router-dom";
import { useState } from "react";
import { PRODUCTS } from "../data/products";
import { useCart } from "../store/cartStore";
import { BRAND } from "../brand.js";

function StarRow({ count = 5 }) {
  return (
    <div className="stars">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="star">★</span>
      ))}
    </div>
  );
}

export default function CollectionPage() {
  const { buyNow } = useCart();
  const [descExpanded, setDescExpanded] = useState(() => ({}));

  const toggleDesc = (id) => {
    setDescExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <section className="collection-header">
        <div className="container">
          <h1>المتجر</h1>
          <p>{BRAND.taglineAr} — مجموعة حالية تركّز على التنظيم، حماية الأغراض، ورؤية أوضح عند الركن.</p>
        </div>
      </section>

      {/* Trust bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--gray-200)", padding: "12px 0" }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
          {["✓ الدفع عند الاستلام", "✓ توصيل 2-5 أيام", "✓ إرجاع 7 أيام"].map((t) => (
            <span key={t} style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>{t}</span>
          ))}
        </div>
      </div>

      <section className="section" style={{ background: "var(--gray-50)", minHeight: "60vh" }}>
        <div className="container">
          <div className="products-grid">
            {PRODUCTS.map((p) => (
              <article key={p.id} className="product-card">
                <div className="product-img-wrap">
                  <img src={p.image} alt={p.name} loading="lazy" />
                  {p.badge && <span className="product-badge">{p.badge}</span>}
                  {p.stock <= 10 && (
                    <span className="stock-badge">
                      <span style={{ width: 6, height: 6, background: "#fff", borderRadius: "50%", display: "inline-block" }} />
                      {p.stock} قطع فقط
                    </span>
                  )}
                </div>
                <div className="product-body">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StarRow />
                    <span className="review-count">({p.reviewCount} تقييم)</span>
                  </div>
                  <h3>{p.name}</h3>
                  <div className="product-benefit">
                    <p>{p.shortBenefit}</p>
                    {p.description && p.description.trim() !== p.shortBenefit?.trim() && (
                      <>
                        {descExpanded[p.id] && (
                          <p style={{ marginTop: 10 }}>{p.description}</p>
                        )}
                        <button
                          type="button"
                          className="product-benefit-toggle"
                          onClick={() => toggleDesc(p.id)}
                        >
                          {descExpanded[p.id] ? "طي الوصف" : "عرض الوصف الكامل"}
                        </button>
                      </>
                    )}
                  </div>
                  <div className="price-tiers">
                    <div className="price-tier-row">
                      <span className="price-tier-label">١ قطعة</span>
                      <span className="price-tier-price">199 ر.س</span>
                    </div>
                    <div className="price-tier-row">
                      <span className="price-tier-label">٢ قطعة</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="price-tier-price">279 ر.س</span>
                        <span className="price-save">وفّر 119</span>
                      </div>
                    </div>
                    <div className="price-tier-row best">
                      <span className="price-tier-label">٣ قطع ⭐ الأفضل</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="price-tier-price">349 ر.س</span>
                        <span className="price-save">وفّر 248</span>
                      </div>
                    </div>
                  </div>
                  <div className="scarcity-line">
                    <span className="scarcity-dot" />
                    تبقّى {p.stock} قطع هذا الأسبوع
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      className="btn btn-gold btn-full"
                      onClick={() => buyNow(p.id)}
                      type="button"
                    >
                      اشتري الآن — الدفع عند الاستلام
                    </button>
                  </div>
                  <Link
                    to={`/products/${p.id}`}
                    className="btn btn-ghost btn-full"
                    style={{ textAlign: "center", marginTop: 4 }}
                  >
                    عرض التفاصيل الكاملة
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
