export default function AboutPage() {
  const values = [
    { icon: "🧪", title: "مواد شفافة", text: "نوضح ما صُنع منه كل منتج لأنك تستحق أن تعرف ما تشترين." },
    { icon: "🚗", title: "مختبر سعودياً", text: "اخترنا منتجاتنا بناءً على مشاكل القيادة اليومية في شوارعنا." },
    { icon: "💳", title: "بدون مخاطرة", text: "الدفع عند الاستلام — لا بطاقة ولا دفع مسبق. ادفعي بعد ما تريني المنتج." },
    { icon: "↩️", title: "إرجاع سهل", text: "إرجاع مجاني خلال 7 أيام إذا لم يعجبك المنتج — بدون تعقيد." },
  ];

  return (
    <>
      <section className="about-hero">
        <div className="container">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(201,150,42,.15)", border: "1px solid rgba(201,150,42,.3)", color: "var(--gold-light)", fontSize: 13, fontWeight: 700, padding: "6px 14px", borderRadius: 50, marginBottom: 20 }}>
            <span>🚗</span> منظومة قيادة يومية للسوق السعودي
          </div>
          <h1>من نحن</h1>
          <p>نيدها اوتو — وُلد من إحباط حقيقي يواجهه كل سائق سعودي كل يوم.</p>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="about-grid">
            <div>
              <span className="section-tag">قصتنا</span>
              <h2 className="section-title">لماذا وُجد نيدها اوتو؟</h2>
              <p style={{ fontSize: 16, color: "var(--gray-600)", lineHeight: 1.8, marginBottom: 16 }}>
                كم مرة تعبت من فوضى أغراضك في السيارة؟ كم مرة فقدت مفاتيحك في فتحة
                المقعد؟ كم مرة أصابك التوتر عند الاصطفاف في مكان ضيق؟
              </p>
              <p style={{ fontSize: 16, color: "var(--gray-600)", lineHeight: 1.8, marginBottom: 16 }}>
                جمعنا هذه المشاكل الثلاث وبنينا منظومة بسيطة تحلها كلها. منتجات
                مختارة بعناية، مواد موثوقة، وتجربة شراء محترمة تبدأ وتنتهي بثقتك.
              </p>
              <p style={{ fontSize: 16, color: "var(--gray-600)", lineHeight: 1.8 }}>
                <strong style={{ color: "var(--navy)" }}>نيدها اوتو</strong> — ليس متجر إكسسوارات. هو منظومة متكاملة لقيادة أهدأ وسيارة أنظف وثقة أكبر.
              </p>
            </div>
            <div>
              <div style={{ background: "var(--navy)", borderRadius: 20, padding: "32px 28px", color: "#fff" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🏆</div>
                <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>الأرقام تتحدث</h3>
                {[
                  ["600+", "عميل راضٍ في المملكة"],
                  ["3", "منتجات تحل 3 مشاكل يومية"],
                  ["7 أيام", "سياسة إرجاع مجانية"],
                  ["COD", "الدفع عند الاستلام دائماً"],
                ].map(([num, label]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.1)", padding: "10px 0" }}>
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
