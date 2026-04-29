import { useMemo, useState } from "react";
import { getActiveCopy } from "../content/copyByVariant";
import { useCart } from "../store/cartStore";

const SAUDI_PHONE_REGEX = /^05\d{8}$/;

function validateName(value) {
  if (!value.trim()) return "الاسم مطلوب.";
  return "";
}

function validatePhone(value) {
  if (!value.trim()) return "رقم الجوال مطلوب.";
  if (!SAUDI_PHONE_REGEX.test(value)) {
    return "اكتب رقم جوال سعودي صحيح يبدأ بـ 05 (مثال: 05XXXXXXXX).";
  }
  return "";
}

export default function CheckoutPopup({ onOrderConfirmed }) {
  const { isCheckoutOpen, closeCheckout, cartItems, checkoutTotal } = useCart();
  const copy = getActiveCopy();
  const [formValues, setFormValues] = useState({ name: "", phone: "" });
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors = useMemo(
    () => ({
      name: validateName(formValues.name),
      phone: validatePhone(formValues.phone),
    }),
    [formValues]
  );

  const isFormValid = !errors.name && !errors.phone;
  const shouldShowError = (field) => touched[field] || submitAttempted;

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleClose = () => {
    closeCheckout();
    setSubmitAttempted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (!isFormValid) return;

    onOrderConfirmed({
      customerName: formValues.name.trim(),
      phone: formValues.phone.trim(),
      items: cartItems,
      total: checkoutTotal,
    });

    setFormValues({ name: "", phone: "" });
    setTouched({ name: false, phone: false });
    setSubmitAttempted(false);
    closeCheckout();
  };

  return (
    <>
      <div
        className={`popup-overlay ${isCheckoutOpen ? "visible" : ""}`}
        onClick={handleClose}
        aria-hidden={!isCheckoutOpen}
      />
      <section className={`checkout-popup ${isCheckoutOpen ? "open" : ""}`}>
        <div className="checkout-header">
          <h2>
            تأكيد طلب الدفع عند الاستلام
            <span className="micro-en">Complete Your COD Order</span>
          </h2>
          <button type="button" className="ghost-btn" onClick={handleClose}>
            إغلاق
          </button>
        </div>

        <div className="checkout-layout">
          <aside className="order-summary">
            <h3>
              ملخص الطلب
              <span className="micro-en">Order Summary</span>
            </h3>
            <ul>
              {cartItems.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <strong>{item.lineTotal} SAR</strong>
                </li>
              ))}
            </ul>
            <div className="summary-total">
              <span>الإجمالي</span>
              <strong>{checkoutTotal} SAR</strong>
            </div>
            <div className="trust-row checkout-trust">
              <span>الدفع عند الاستلام</span>
              <span>لا يوجد دفع مسبق</span>
              <span>توصيل لجميع مناطق السعودية</span>
              <span>خدمة عملاء سريعة</span>
            </div>
          </aside>

          <form className="checkout-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="name">
              الاسم
              <span className="micro-en">Name</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formValues.name}
              onChange={handleFieldChange}
              onBlur={handleBlur}
              placeholder="اكتب الاسم الكامل"
              aria-invalid={Boolean(shouldShowError("name") && errors.name)}
            />
            {shouldShowError("name") && errors.name && (
              <p className="field-error">{errors.name}</p>
            )}

            <label htmlFor="phone">
              رقم الجوال
              <span className="micro-en">Saudi Phone Number</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              className="ltr-inline"
              value={formValues.phone}
              onChange={handleFieldChange}
              onBlur={handleBlur}
              placeholder="05XXXXXXXX"
              aria-invalid={Boolean(shouldShowError("phone") && errors.phone)}
            />
            {shouldShowError("phone") && errors.phone && (
              <p className="field-error">{errors.phone}</p>
            )}

            <div className="cod-guidance">
              {copy.checkout.guidance.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <button type="submit" className="primary-btn" disabled={!isFormValid}>
              تأكيد الطلب
            </button>
            <p className="cta-note">{copy.checkout.ctaNote}</p>
          </form>
        </div>
      </section>
    </>
  );
}
