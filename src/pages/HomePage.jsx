import { Link } from "react-router-dom";
import { PRODUCTS } from "../data/products";
import { useCart } from "../store/cartStore";
import { useState } from "react";
import { BRAND } from "../brand.js";

const REVIEWS = [
  {
    name: "نورة م.",
    city: "الرياض",
    initial: "ن",
    product: "المنظّم الذكي للمقعد",
    text: "المنظّم غيّر حياتي. سيارتي كانت فوضى وكنت أخجل من أي راكب. الحين كل شيء له مكان والسيارة تبيّن شخصيتي.",
    rating: 5,
  },
  {
    name: "سارة ع.",
    city: "جدة",
    initial: "س",
    product: "حامي فراغ المقعد",
    text: "كل يوم أدور مفاتيحي في نفس الفتحة الملعونة. بعد الحامي — صفر مشاكل. اشتريت نسخة ثانية لسيارة أهلي.",
    rating: 5,
  },
  {
    name: "ريم ا.",
    city: "الدمام",
    initial: "ر",
    product: "طقم مرايا الاصطفاف الدقيق",
    text: "موقف العمل ضيق وكنت أتوتر كل يوم. بعد طقم المرايا صرت أصطف بثقة. النتيجة من أول يوم والمواد قوية جداً.",
    rating: 5,
  },
];

const FAQS = [
  { q: "هل الدفع عند الاستلام فقط؟", a: "نعم، جميع طلباتنا بالدفع عند الاستلام. لا حاجة لبطاقة ائتمانية أو دفع إلكتروني مسبق." },
  { q: "كم يستغرق التوصيل؟", a: "2-5 أيام عمل لمعظم مناطق المملكة. الرياض وجدة والدمام عادةً 2-3 أيام." },
  { q: "هل يمكنني إرجاع المنتج؟", a: "نعم، نقبل الإرجاع خلال 7 أيام من تاريخ الاستلام إذا كان المنتج في حالته الأصلية." },
  { q: "هل المنتجات مناسبة لجميع السيارات؟", a: "نعم، منتجاتنا مصممة لتناسب معظم سيارات السيدان والـ SUV الشائعة في السعودية." },
];

function StarRow({ count = 5 }) {
  return (
    <div className="stars">
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

export default function HomePage() {
  const { addToCart } = useCart();

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-badge">
            <span>✓</span>
            <span>إكسسوارات مقصورة مختارة — ثقة ووضوح</span>
          </div>
          <h1>
            مقصورة أنظف…<br />
            <span>قيادة أوثق</span>
          </h1>
          <p>
            {BRAND.nameAr} تجمع لك منظّم المقعد، حامي فراغ المقعد، وطقم مرايا الركن — لحلّ الفوضى
            داخل السيارة وقلق المواقف الضيقة، مع الدفع عند الاستلام والتوصيل داخل المملكة.
          </p>
          <div className="hero-cta">
            <Link to="/collection" className="btn btn-gold btn-lg">
              اكتشف المجموعة ←
            </Link>
            <Link to="/about" className="btn btn-outline">
              من نحن
            </Link>
          </div>
          <div className="hero-trust">
            <div className="trust-chip"><span className="check">✓</span> الدفع عند الاستلام</div>
            <div className="trust-chip"><span className="check">✓</span> توصيل سريع 2-5 أيام</div>
            <div className="trust-chip"><span className="check">✓</span> إرجاع مجاني 7 أيام</div>
          </div>
        </div>
      </section>

      {/* PAIN STRIP */}
      <section className="pain-strip">
        <div className="pain-grid">
          <div className="pain-item">
            <div className="pain-icon">🔧</div>
            <h3>الفوضى في السيارة</h3>
            <p>أغراضك في كل مكان ومكان راحة ركابك يعاني؟ المنظّم يحل هذا فورياً.</p>
          </div>
          <div className="pain-item">
            <div className="pain-icon">🔑</div>
            <h3>أغراض تختفي يومياً</h3>
            <p>مفاتيح، سماعات، عملات — كلها تختفي في فتحة المقعد كل يوم.</p>
          </div>
          <div className="pain-item">
            <div className="pain-icon">🚗</div>
            <h3>قلق الاصطفاف</h3>
            <p>الزاوية العمياء والأماكن الضيقة — زد مجال رؤيتك واصطف بثقة.</p>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-header section-header--center">
            <span className="section-tag">منتجاتنا</span>
            <h2 className="section-title">المنظومة الكاملة</h2>
            <p className="section-sub">ثلاثة منتجات. ثلاث مشاكل محلولة. سيارة أهدأ وأنت أكثر راحة.</p>
          </div>
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
                    <span className="review-count">({p.reviewCount})</span>
                  </div>
                  <h3>{p.name}</h3>
                  <p className="product-benefit">{p.shortBenefit}</p>
                  <div className="price-tiers">
                    <div className="price-tier-row">
                      <span className="price-tier-label">قطعة واحدة</span>
                      <span className="price-tier-price">199 ر.س</span>
                    </div>
                    <div className="price-tier-row">
                      <span className="price-tier-label">قطعتان</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="price-tier-price">279 ر.س</span>
                        <span className="price-save">وفّر 119</span>
                      </div>
                    </div>
                    <div className="price-tier-row best">
                      <span className="price-tier-label">٣ قطع ⭐</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="price-tier-price">349 ر.س</span>
                        <span className="price-save">وفّر 248</span>
                      </div>
                    </div>
                  </div>
                  <div className="scarcity-line">
                    <span className="scarcity-dot" />
                    تبقّى {p.stock} قطع فقط هذا الأسبوع
                  </div>
                  <div className="product-cta" style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button
                      className="btn btn-gold btn-full"
                      onClick={() => addToCart(p.id)}
                      type="button"
                    >
                      اشتري الآن
                    </button>
                    <Link to={`/products/${p.id}`} className="btn btn-ghost">
                      تفاصيل
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="section" style={{ background: "var(--gray-50)" }}>
        <div className="container">
          <div className="section-header section-header--center">
            <span className="section-tag">لماذا {BRAND.nameAr}</span>
            <h2 className="section-title">ثقتك تهمنا</h2>
          </div>
          <div className="trust-grid">
            <div className="trust-card">
              <div className="trust-icon">💳</div>
              <h4>الدفع عند الاستلام</h4>
              <p>لا بطاقة، لا دفع مسبق. ادفع بعد ما يوصل المنتج بين يديك.</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">📦</div>
              <h4>توصيل سريع</h4>
              <p>2-5 أيام عمل لجميع مناطق المملكة العربية السعودية.</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">↩️</div>
              <h4>إرجاع مجاني</h4>
              <p>راجع المنتج وإذا ما عجبك — إرجاع مجاني خلال 7 أيام.</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">🧪</div>
              <h4>منتجات مختبرة</h4>
              <p>اخترنا كل منتج لحل مشكلة يومية حقيقية في بيئة القيادة السعودية.</p>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-header section-header--center">
            <span className="section-tag">آراء عملائنا</span>
            <h2 className="section-title">ماذا قالوا عنّا</h2>
            <p className="section-sub">تجارب عملاء يشاركونا انطباعهم بعد استخدام الإكسسوارات في يومهم.</p>
          </div>
          <div className="reviews-grid">
            {REVIEWS.map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-header">
                  <div className="reviewer">
                    <div className="reviewer-avatar">{r.initial}</div>
                    <div>
                      <div className="reviewer-name">{r.name}</div>
                      <div className="reviewer-city">📍 {r.city}</div>
                    </div>
                  </div>
                  <StarRow count={r.rating} />
                </div>
                <p className="review-text">"{r.text}"</p>
                <p className="review-product">✓ اشترت: {r.product}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ background: "var(--gray-50)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="section-header section-header--center">
            <span className="section-tag">أسئلة شائعة</span>
            <h2 className="section-title">عندك سؤال؟</h2>
          </div>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
