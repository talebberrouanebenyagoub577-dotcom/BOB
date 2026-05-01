import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STEPS = [
  "فريقنا سيتصل بك قريباً لتأكيد طلبك",
  "سيتم شحن طلبك بعد التأكيد مباشرة",
  "الطلب يصلك خلال 2-5 أيام عمل",
  "الدفع نقداً للمندوب عند الاستلام",
];

export default function ThankYouPage({ order }) {
  if (!order) return null;

  const maskedPhone =
    order.phone?.length >= 7
      ? `${order.phone.slice(0, 3)}****${order.phone.slice(-3)}`
      : order.phone;

  const [countdown, setCountdown] = useState(10 * 60);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const mins = String(Math.floor(countdown / 60)).padStart(2, "0");
  const secs = String(countdown % 60).padStart(2, "0");

  return (
    <main className="thankyou-page">
      <div className="thankyou-card">
        {/* Header */}
        <div className="thankyou-header">
          <div className="success-icon">✅</div>
          <h1>تم استلام طلبك!</h1>
          <p>شكراً لك يا {order.customerName} — طلبك في قائمة المعالجة.</p>
        </div>

        <div className="thankyou-body">
          {/* Phone reminder */}
          <div className="phone-reminder">
            <h4>📞 خلّي جوالك قريب!</h4>
            <p>
              سنتصل على الرقم{" "}
              <span className="masked-phone">{maskedPhone}</span>{" "}
              قريباً لتأكيد الطلب وتحديد موعد التوصيل.
            </p>
            {countdown > 0 && (
              <p style={{ marginTop: 8, fontWeight: 700, color: "#92400E" }}>
                الحجز نشط لمدة: <span style={{ fontFamily: "monospace", fontSize: 16, color: "#DC2626" }}>{mins}:{secs}</span>
              </p>
            )}
          </div>

          {/* Next steps */}
          <div className="next-steps">
            <h3>الخطوات القادمة</h3>
            <div className="step-list">
              {STEPS.map((step, i) => (
                <div key={i} className="step-item">
                  <div className="step-num-circle">{i + 1}</div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="order-summary-ty">
            <h3>ملخص طلبك</h3>
            {order.items.map((item) => (
              <div key={item.id} className="order-line">
                <span className="order-line-name">
                  {item.name} × {item.quantity}
                </span>
                <span className="order-line-price">{item.lineTotal} ر.س</span>
              </div>
            ))}
            {order.upsellAccepted && order.upsellProduct && (
              <div className="order-line">
                <span className="order-line-name">{order.upsellProduct.name} (عرض خاص)</span>
                <span className="order-line-price">{order.upsellPrice} ر.س</span>
              </div>
            )}
            <div className="order-total-row">
              <span>الإجمالي</span>
              <strong>{order.total} ر.س</strong>
            </div>
          </div>

          {/* Trust chips */}
          <div className="ty-trust">
            <div className="ty-chip green">✓ الدفع عند الاستلام</div>
            <div className="ty-chip green">✓ توصيل 2-5 أيام</div>
            <div className="ty-chip green">✓ إرجاع مجاني 7 أيام</div>
          </div>

          {/* Order ID */}
          <p style={{ fontSize: 13, color: "var(--gray-400)", textAlign: "center" }}>
            رقم الطلب:{" "}
            <strong style={{ color: "var(--navy)", fontFamily: "monospace" }}>
              {order.orderId ?? "N/A"}
            </strong>
          </p>

          <Link to="/collection" className="btn btn-navy btn-full" style={{ textAlign: "center" }}>
            تصفّح المزيد من المنتجات
          </Link>
        </div>
      </div>
    </main>
  );
}
