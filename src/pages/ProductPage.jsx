import { Link, useParams, Navigate } from "react-router-dom";
import { useState } from "react";
import { PRODUCTS, CROSS_SELL_MAP } from "../data/products";
import { getProductPageHeroUrl } from "../data/productDetailMedia";
import { useCart } from "../store/cartStore";
import { ParkingMirrorStoryVite } from "../components/ParkingMirrorStoryVite";
import { SeatOrganizerStoryVite } from "../components/SeatOrganizerStoryVite";
import { SeatGapProtectorStoryVite } from "../components/SeatGapProtectorStoryVite";

const PRICING = [
  { qty: 1, price: 199, label: "قطعة واحدة", save: null },
  { qty: 2, price: 279, label: "قطعتان", save: "وفّر 119 ر.س" },
  { qty: 3, price: 349, label: "٣ قطع — الأوفر ⭐", save: "وفّر 248 ر.س" },
];

function StarRow({ count = 5 }) {
  return (
    <div className="stars" style={{ flexDirection: "row" }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="star">★</span>
      ))}
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className={`faq-q ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
        {q}
        <span className="faq-chevron">▾</span>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const product = PRODUCTS.find((p) => p.id === id);
  const { buyNow, isCheckoutOpen } = useCart();
  const [selectedQty, setSelectedQty] = useState(1);

  if (!product) return <Navigate to="/collection" replace />;

  const crossSellIds = CROSS_SELL_MAP[product.id] ?? [];
  const crossSellProducts = crossSellIds.map((cid) => PRODUCTS.find((p) => p.id === cid)).filter(Boolean);

  const selectedTier = PRICING.find((t) => t.qty === selectedQty) ?? PRICING[0];
  const detailHeroSrc = getProductPageHeroUrl(product.id);

  const handleBuy = () => {
    buyNow(product.id, selectedQty);
  };

  return (
    <>
      <section className="product-page">
        <div className="container">
          {/* Breadcrumb */}
          <div style={{ marginBottom: 24, display: "flex", gap: 8, alignItems: "center", fontSize: 14, color: "var(--gray-600)" }}>
            <Link to="/" style={{ color: "var(--gold)" }}>الرئيسية</Link>
            <span>/</span>
            <Link to="/collection" style={{ color: "var(--gold)" }}>المتجر</Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>

          <div className="product-page-grid">
            {/* Gallery */}
            <div className="product-gallery">
              <div
                className={`main-img ${
                  product.id === "parking-mirror"
                    ? "main-img--detail-hero main-img--parking-hero"
                    : product.id === "seat-organizer" ||
                        product.id === "seatgap-protector"
                      ? "main-img--detail-hero main-img--pdp-hero"
                      : detailHeroSrc
                        ? "main-img--detail-hero"
                        : ""
                }`}
              >
                <img
                  src={detailHeroSrc ?? product.image}
                  alt={product.name}
                />
                <span className="product-badge-lg">{product.badge}</span>
              </div>
            </div>

            {/* Info */}
            <div className="product-info">
              {/* Ratings */}
              <div className="ratings-row">
                <StarRow />
                <span className="ratings-count">({product.reviewCount} تقييم)</span>
                <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 700, background: "var(--green-light)", padding: "2px 8px", borderRadius: 6 }}>
                  ✓ مُختبر
                </span>
              </div>

              {/* Title */}
              <h1 className="product-title">{product.name}</h1>
              <p className="product-sub">{product.description}</p>

              {Array.isArray(product.longDescription) && product.longDescription.length > 0 && (
                <div className="product-story">
                  {product.longDescription.map((para, i) => (
                    <p key={i} className="product-story-p">{para}</p>
                  ))}
                </div>
              )}

              {Array.isArray(product.whatsInBox) && product.whatsInBox.length > 0 && (
                <div className="product-inbox-section">
                  <h3>ما الذي يصلك مع الطلب؟</h3>
                  <ul className="product-inbox-list">
                    {product.whatsInBox.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}

              {product.idealFor && (
                <p className="product-ideal">
                  <strong>لمن يناسب؟</strong> {product.idealFor}
                </p>
              )}

              {/* Scarcity */}
              <div className="scarcity-line">
                <span className="scarcity-dot" />
                تبقّى <strong style={{ color: "#D97706" }}>{product.stock} قطع فقط</strong> هذا الأسبوع
              </div>

              {/* Price Box */}
              <div className="price-box">
                <div className="price-main">
                  <span className="price-amount">{selectedTier.price}</span>
                  <span className="price-currency">ر.س</span>
                  <span style={{ fontSize: 13, color: "var(--gray-400)", marginRight: 4 }}>
                    {selectedQty === 1 ? "· قطعة واحدة" : `· ${selectedQty} قطع`}
                  </span>
                </div>
                {!isCheckoutOpen && (
                  <div className="price-tier-list">
                    {PRICING.map((tier) => (
                      <button
                        key={tier.qty}
                        type="button"
                        className={`price-tier-item ${selectedQty === tier.qty ? "active-tier" : ""}`}
                        onClick={() => setSelectedQty(tier.qty)}
                        style={{ background: "none", border: "1px solid", borderColor: selectedQty === tier.qty ? "var(--gold)" : "var(--gray-200)", cursor: "pointer", borderRadius: 8, textAlign: "right", fontFamily: "var(--font)", transition: "all .15s" }}
                      >
                        <span className="qty-label">{tier.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="qty-price">{tier.price} ر.س</span>
                          {tier.save && <span className="qty-save">{tier.save}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Benefits */}
              <div className="benefits-list">
                {product.benefits.map((b, i) => (
                  <div key={i} className="benefit-item">
                    <span className="benefit-check">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {!isCheckoutOpen && (
                <button
                  className="btn btn-gold btn-full btn-lg"
                  onClick={handleBuy}
                  type="button"
                >
                  اشتري الآن — الدفع عند الاستلام
                </button>
              )}

              {/* COD Trust */}
              <div className="cod-trust-bar">
                <div className="cod-chip"><span>✓</span> الدفع عند الاستلام</div>
                <div className="cod-chip"><span>✓</span> توصيل 2-5 أيام</div>
                <div className="cod-chip"><span>✓</span> إرجاع 7 أيام</div>
                <div className="cod-chip"><span>✓</span> بدون بطاقة</div>
              </div>

              {/* How it works */}
              <div className="how-section">
                <h3>🔧 كيف يعمل؟</h3>
                <div className="how-steps">
                  {product.howItWorks.map((step, i) => (
                    <div key={i} className="how-step">
                      <div className="step-num">{i + 1}</div>
                      <p className="step-text">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div className="materials-section">
                <h3>🧪 المواد والمواصفات</h3>
                <p className="materials-text">{product.materials}</p>
              </div>

              {/* FAQ */}
              {product.faqs && product.faqs.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--navy)", marginBottom: 14 }}>أسئلة شائعة</h3>
                  <div className="faq-list">
                    {product.faqs.map((faq, i) => (
                      <FaqItem key={i} q={faq.q} a={faq.a} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {product.id === "parking-mirror" && <ParkingMirrorStoryVite />}
          {product.id === "seat-organizer" && <SeatOrganizerStoryVite />}
          {product.id === "seatgap-protector" && <SeatGapProtectorStoryVite />}

        </div>
      </section>

      {/* CROSS SELL */}
      {crossSellProducts.length > 0 && (
        <section className="cross-sell-section">
          <div className="container">
            <div className="section-header section-header--center">
              <span className="section-tag">أكمل منظومتك</span>
              <h2 className="section-title">يُطلب معه غالباً</h2>
            </div>
            <div className="products-grid">
              {crossSellProducts.map((cp) => (
                <article key={cp.id} className="product-card">
                  <div className="product-img-wrap">
                    <img src={cp.image} alt={cp.name} loading="lazy" />
                    {cp.badge && <span className="product-badge">{cp.badge}</span>}
                  </div>
                  <div className="product-body">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <StarRow />
                      <span className="review-count">({cp.reviewCount})</span>
                    </div>
                    <h3>{cp.name}</h3>
                    <p className="product-benefit">{cp.shortBenefit}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 24, fontWeight: 900, color: "var(--navy)" }}>{cp.price}</span>
                      <span style={{ fontSize: 14, color: "var(--gray-600)" }}>ر.س</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {!isCheckoutOpen && (
                        <button className="btn btn-gold btn-full" onClick={() => buyNow(cp.id)} type="button">
                          اشتري الآن
                        </button>
                      )}
                      <Link
                        to={`/products/${cp.id}`}
                        className="btn btn-ghost"
                        style={isCheckoutOpen ? { flex: 1, textAlign: "center" } : undefined}
                      >
                        تفاصيل
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

    </>
  );
}
