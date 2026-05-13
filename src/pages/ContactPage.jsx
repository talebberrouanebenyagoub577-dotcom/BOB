import { useState } from "react";
import { BRAND } from "../brand.js";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "الاسم مطلوب";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "بريد إلكتروني غير صحيح";
    if (!form.message.trim() || form.message.trim().length < 10) e.message = "الرسالة مطلوبة (١٠ أحرف على الأقل)";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSent(true);
  };

  return (
    <>
      <section className="collection-header">
        <div className="container">
          <h1>تواصل معنا</h1>
          <p>لديك سؤال أو استفسار؟ نحن هنا للمساعدة</p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--gray-50)" }}>
        <div className="container">
          <div className="contact-phone-sheet mb-10" style={{ maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            <p className="contact-phone-sheet__title">الرقم الموحَّد للتواصل</p>
            <p className="contact-phone-sheet__sub">
              هذا هو الرقم الرسمي الوحيد في المتجر؛ يمكنك الضغط للاتصال مباشرة.
            </p>
            <a href={`tel:${BRAND.contactPhoneIntl}`} className="contact-phone-sheet__link" dir="ltr">
              {BRAND.contactPhoneIntl}
            </a>
          </div>
          <div className="contact-wrap">
            {/* Form */}
            <div className="contact-form-card">
              {sent ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 8 }}>تم إرسال رسالتك!</h3>
                  <p style={{ color: "var(--gray-600)", fontSize: 15 }}>سنرد عليك خلال 24 ساعة في أيام العمل.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", marginBottom: 20 }}>أرسل لنا رسالة</h3>

                  <div className="form-field">
                    <label className="form-label" htmlFor="name">الاسم الكامل</label>
                    <input
                      id="name"
                      className={`form-input ${errors.name ? "error" : ""}`}
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="اكتب اسمك"
                    />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="email">البريد الإلكتروني</label>
                    <input
                      id="email"
                      className={`form-input ${errors.email ? "error" : ""}`}
                      type="email"
                      dir="ltr"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="example@email.com"
                      style={{ textAlign: "left" }}
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="message">رسالتك</label>
                    <textarea
                      id="message"
                      className={`form-input form-textarea ${errors.message ? "error" : ""}`}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="اكتب رسالتك هنا..."
                    />
                    {errors.message && <span className="field-error">{errors.message}</span>}
                  </div>

                  <button type="submit" className="btn btn-navy btn-full" style={{ marginTop: 8 }}>
                    إرسال الرسالة ←
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="contact-info">
              <div className="contact-info-item">
                <div className="contact-icon">📧</div>
                <div>
                  <h4>البريد الإلكتروني</h4>
                  <p>support@nidhamauto.shop</p>
                  <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>نرد خلال 24 ساعة في أيام العمل</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon">🕐</div>
                <div>
                  <h4>أوقات العمل</h4>
                  <p>الأحد – الخميس</p>
                  <p>٩ صباحاً – ٦ مساءً</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon">💳</div>
                <div>
                  <h4>الدفع عند الاستلام</h4>
                  <p>جميع طلباتنا بالدفع عند الاستلام فقط. لا حاجة لبطاقة.</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon">↩️</div>
                <div>
                  <h4>الإرجاع والاسترداد</h4>
                  <p>إرجاع مجاني خلال 7 أيام من الاستلام.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
