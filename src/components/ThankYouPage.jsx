import { useEffect, useMemo, useState } from "react";
import { getActiveCopy } from "../content/copyByVariant";

const RESERVATION_SECONDS = 10 * 60;

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

export default function ThankYouPage({ order }) {
  if (!order) return null;
  const copy = getActiveCopy();

  const maskedPhone =
    order.phone?.length >= 4
      ? `${order.phone.slice(0, 3)}****${order.phone.slice(-3)}`
      : order.phone;
  const [secondsLeft, setSecondsLeft] = useState(RESERVATION_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const isReservationActive = secondsLeft > 0;
  const reservationMessage = useMemo(() => {
    if (isReservationActive) {
      return copy.thankYou.reservationActive(formatTime(secondsLeft));
    }
    return copy.thankYou.reservationExpired;
  }, [isReservationActive, secondsLeft, copy]);

  return (
    <main className="thank-you">
      <section className="thank-you-card">
        <p className="thank-you-badge">تم تسجيل الطلب في النظام</p>
        <h1>تم استلام طلبك بنجاح</h1>
        <p>
          شكرًا لك يا {order.customerName}. سيتم الاتصال بك قريبًا على{" "}
          <strong className="ltr-inline">{maskedPhone}</strong> لتأكيد بيانات التوصيل.
        </p>
        <p className="call-trust-line">
          سيتم الاتصال بك قريبًا لتأكيد الطلب.
          <span className="micro-en">Our team will call you shortly to confirm your order.</span>
        </p>
        <p className="cod-reassurance">
          {copy.thankYou.reassurance}
          <span className="micro-en">Your order is secured and processing starts quickly.</span>
        </p>

        <section className="reservation-status" aria-live="polite">
          <p>{reservationMessage}</p>
          {isReservationActive && (
            <strong className="reservation-timer ltr-inline">{formatTime(secondsLeft)}</strong>
          )}
        </section>

        <div className="trust-row">
          <span>الدفع عند الاستلام</span>
          <span>توصيل لجميع مناطق السعودية</span>
          <span>خدمة عملاء سريعة</span>
        </div>

        <section className="urgent-box">
          <h3>{copy.thankYou.urgentTitle}</h3>
          <p>{copy.thankYou.urgentBody}</p>
          <p className="urgent-subline">{copy.thankYou.urgentSubline}</p>
        </section>

        <section className="next-steps">
          <h3>الخطوات القادمة</h3>
          <ol>
            <li>مكالمة تأكيد سريعة من فريقنا.</li>
            <li>مراجعة العنوان بشكل واضح (الحي، الشارع، رقم المنزل).</li>
            <li>التوصيل خلال 2–5 أيام عمل مع تحديد وقت مناسب.</li>
            <li>التوصيل والدفع عند الاستلام بدون دفع مسبق.</li>
          </ol>
        </section>

        <h3>
          ملخص الطلب
          <span className="micro-en">Order Summary</span>
        </h3>
        <ul className="thank-you-list">
          {order.items.map((item) => (
            <li key={item.id}>
              <span>
                {item.name} x{item.quantity}
              </span>
              <strong>{item.lineTotal} SAR</strong>
            </li>
          ))}
          {order.upsellAccepted && order.upsellProduct && (
            <li>
              <span>{order.upsellProduct.name} (عرض لمرة واحدة)</span>
              <strong>{order.upsellPrice} SAR</strong>
            </li>
          )}
        </ul>
        <div className="summary-total">
          <span>الإجمالي</span>
          <strong>{order.total} SAR</strong>
        </div>

        <p className="thank-you-help">
          تحتاج مساعدة في الطلب؟ تواصل مع الدعم وشارك رقم الطلب:{" "}
          <strong>{order.orderId || order.order_id || "N/A"}</strong>
        </p>
      </section>
    </main>
  );
}
