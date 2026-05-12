import { BRAND } from "../brand.js";

export default function AboutPage() {
  const values = [
    { icon: "🧪", title: "شفافية المواد", text: "نوضّح مادة كل منتج لأن الثقة تبدأ من الوضوح." },
    { icon: "🚗", title: "من واقع القيادة في السعودية", text: "نختار الحلول التي تلائم المواقف الضيقة والاستخدام اليومي المتكرر." },
    { icon: "💳", title: "بدون دفع مسبق", text: "الدفع عند الاستلام — راجِع المنتج ثم ادفع نقداً للمندوب." },
    { icon: "↩️", title: "إرجاع منظم", text: "سياسة إرجاع خلال 7 أيام وفق الشروط المعلنة." },
  ];

  return (
    <>
      <section className="about-hero">
        <div className="container">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(201,162,77,.15)",
              border: "1px solid rgba(201,162,77,.35)",
              color: "var(--gold-light)",
              fontSize: 13,
              fontWeight: 700,
              padding: "6px 14px",
              borderRadius: 50,
              marginBottom: 20,
            }}
          >
            <span>🚗</span> {BRAND.taglineAr}
          </div>
          <h1>من نحن</h1>
          <p>
            {BRAND.nameAr} — {BRAND.positioningAr}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="about-grid">
            <div>
              <span className="section-tag">قصتنا</span>
              <h2 className="section-title">لماذا وُجدت {BRAND.nameAr}؟</h2>
              <p style={{ fontSize: 16, color: "var(--gray-600)", lineHeight: 1.8, marginBottom: 16 }}>
                من فوضى المقصورة إلى ضياع الجوال في فتحة المقعد، وصولاً لتوتر الركن بجانب الرصيف —
                أردنا علامة تجارية سعودية تركّز على <strong>إكسسوارات داخل السيارة</strong> تجمع بين
                الجدوى والشكل المرتب، لا على تكديس منتجات عشوائية.
              </p>
              <p style={{ fontSize: 16, color: "var(--gray-600)", lineHeight: 1.8, marginBottom: 16 }}>
                نعبّر عن هويتنا بالوضوح: منتجات نختارها، نشرح فائدتها، ونربطها بتجربة طلب بسيطة مع خدمة
                توصيل داخل المملكة.
              </p>
              <p style={{ fontSize: 16, color: "var(--gray-600)", lineHeight: 1.8 }}>
                <strong style={{ color: "var(--navy)" }}>{BRAND.nameAr}</strong> — منظومة إكسسوارات
                مقصورة تساعدك على قيادة أكثر هدوءاً وثقة.
              </p>
            </div>
            <div>
              <div style={{ background: "var(--navy)", borderRadius: 20, padding: "32px 28px", color: "#fff" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🏆</div>
                <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>نلتزم بـ</h3>
                {[
                  ["وضوح", "أسعار وشروط مفهومة قبل الشراء"],
                  ["٣", "مجالات: تنظيم — حماية — رؤية"],
                  ["٧ أيام", "إطار إرجاع وفق السياسة"],
                  ["COD", "الدفع عند الاستلام حيث ينطبق"],
                ].map(([num, label]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px solid rgba(255,255,255,.1)",
                      padding: "10px 0",
                    }}
                  >
                    <span style={{ color: "var(--gold)", fontWeight: 900, fontSize: 18 }}>{num}</span>
                    <span style={{ color: "rgba(255,255,255,.7)", fontSize: 14 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--gray-50)" }}>
        <div className="container">
          <div className="section-header section-header--center">
            <span className="section-tag">قيمنا</span>
            <h2 className="section-title">ما يميّزنا</h2>
          </div>
          <div className="about-values" style={{ maxWidth: 720, margin: "0 auto" }}>
            {values.map((v, i) => (
              <div key={i} className="about-value">
                <div className="about-value-icon">{v.icon}</div>
                <h4>{v.title}</h4>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
