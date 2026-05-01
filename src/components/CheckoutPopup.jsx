import { useMemo, useState } from "react";
import { useCart } from "../store/cartStore";

const SAUDI_PHONE_REGEX = /^05\d{8}$/;

function validate(values) {
  const errors = {};
  if (!values.name.trim() || values.name.trim().length < 2) errors.name = "الاسم مطلوب (حرفان على الأقل)";
  if (!SAUDI_PHONE_REGEX.test(values.phone)) errors.phone = "أدخل رقم جوال سعودي صحيح — مثال: 05XXXXXXXX";
  return errors;
}

export default function CheckoutPopup({ onOrderConfirmed }) {
  const { isCheckoutOpen, closeCheckout, cartItems, checkoutTotal } = useCart();
  const [values, setValues] = useState({ name: "", phone: "" });
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => validate(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  const showErr = (f) => touched[f] || submitted;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((p) => ({ ...p, [name]: value }));
  };

  const handleBlur = (e) => setTouched((p) => ({ ...p, [e.target.name]: true }));

  const handleClose = () => {
    closeCheckout();
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid) return;

    setLoading(true);
    try {
      await onOrderConfirmed({
        customerName: values.name.trim(),
        phone: values.phone.trim(),
        items: cartItems,
        total: checkoutTotal,
      });
      setValues({ name: "", phone: "" });
      setTouched({ name: false, phone: false });
      setSubmitted(false);
      closeCheckout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`popup-overlay ${isCheckoutOpen ? "visible" : ""}`}
        onClick={handleClose}
        aria-hidden={!isCheckoutOpen}
      />
      <section className={`checkout-popup ${isCheckoutOpen ? "open" : ""}`} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="popup-header">
          <div>
            <p className="popup-title">تأكيد الطلب</p>
            <p className="popup-sub">الدفع عند الاستلام — بدون بطاقة</p>
          </div>
          <button className="close-btn" style={{ color: "rgba(255,255,255,.6)" }} onClick={handleClose} type="button">✕</button>
        </div>

        <div className="popup-layout">
          {/* Form side */}
          <div className="popup-form-wrap">
            <h3>بياناتك</h3>
            <p style={{ fontSize: 13, color: "var(--gray-600)", marginBottom: 8 }}>
              حقلان فقط — وطلبك يكون جاهز ✓
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 14 }}>
                <label className="input-label" htmlFor="co-name">الاسم الكامل</label>
                <input
                  id="co-name"
                  name="name"
                  type="text"
                  className={`checkout-input ${showErr("name") && errors.name ? "invalid" : ""}`}
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="مثال: نورة العمري"
                  autoComplete="name"
                />
                {showErr("name") && errors.name && (
                  <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4, fontWeight: 600 }}>{errors.name}</p>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="input-label" htmlFor="co-phone">رقم الجوال (السعودي)</label>
                <input
                  id="co-phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  dir="ltr"
                  className={`checkout-input ${showErr("phone") && errors.phone ? "invalid" : ""}`}
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="05XXXXXXXX"
                  autoComplete="tel"
                />
                {showErr("phone") && errors.phone ? (
                  <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4, fontWeight: 600 }}>{errors.phone}</p>
                ) : (
                  <p style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 4 }}>مثال: 0512345678</p>
                )}
              </div>

              {/* Trust */}
              <div className="checkout-trust">
                <div className="checkout-trust-item">✓ الدفع عند الاستلام — راجع المنتج قبل ما تدفع</div>
                <div className="checkout-trust-item">✓ لا دفع إلكتروني ولا بطاقة ائتمانية</div>
                <div className="checkout-trust-item">✓ توصيل خلال 2-5 أيام عمل</div>
              </div>

              <button
                type="submit"
                className="btn btn-gold btn-full btn-lg"
                style={{ marginTop: 16 }}
                disabled={loading}
              >
                {loading ? (
                  <span>⏳ جاري المعالجة...</span>
                ) : (
                  "تأكيد طلبي ←"
                )}
              </button>
              <p style={{ fontSize: 12, color: "var(--gray-400)", textAlign: "center", marginTop: 8 }}>
                ستدفع نقداً عند استلام الطلب
              </p>
            </form>
          </div>

          {/* Summary side */}
          <div className="popup-summary">
            <h3>ملخص طلبك</h3>
            <div className="popup-items">
              {cartItems.map((item) => (
                <div key={item.id} className="popup-item">
                  <div>
                    <div className="popup-item-name">{item.name}</div>
                    <div className="popup-item-qty">× {item.quantity}</div>
                  </div>
                  <div className="popup-item-price">{item.lineTotal} ر.س</div>
                </div>
              ))}
            </div>
            <div className="popup-total">
              <span>الإجمالي</span>
              <strong>{checkoutTotal} ر.س</strong>
            </div>

            {/* Social proof */}
            <div className="popup-proof">
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                {["★","★","★","★","★"].map((s,i) => <span key={i} style={{ color: "var(--gold)", fontSize: 14 }}>{s}</span>)}
                <span style={{ fontSize: 13, color: "var(--gray-600)", fontWeight: 600 }}>+600 عميل راضٍ</span>
              </div>

              <div className="proof-item">
                <span className="proof-icon">✓</span>
                <span>"وصل بسرعة والمنتج أحسن من المتوقع" — نورة م. الرياض</span>
              </div>
              <div className="proof-item">
                <span className="proof-icon">✓</span>
                <span>"خدمة ممتازة والدفع عند الاستلام أشعرني بالأمان" — سارة ع. جدة</span>
              </div>

              {/* Scarcity */}
              <div className="proof-scarcity">
                <p>🔥 الكميات محدودة هذا الأسبوع — أكمل طلبك الآن</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
