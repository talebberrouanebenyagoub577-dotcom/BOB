import { useEffect, useState } from "react";
import { getUpsellPrice } from "../lib/pricing";

export default function UpsellOfferModal({
  isOpen,
  offerProduct,
  countdownSeconds = 12,
  onAccept,
  onReject,
}) {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const [accepted, setAccepted] = useState(false);
  const upsellPrice = getUpsellPrice();

  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(countdownSeconds);
    setAccepted(false);
  }, [isOpen, countdownSeconds]);

  useEffect(() => {
    if (!isOpen || secondsLeft <= 0) {
      if (isOpen && secondsLeft <= 0) onReject();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [isOpen, secondsLeft, onReject]);

  const handleAccept = () => {
    if (accepted) return;
    setAccepted(true);
    onAccept();
  };

  if (!isOpen && !offerProduct) return null;

  return (
    <>
      <div className={`upsell-overlay ${isOpen ? "visible" : ""}`} aria-hidden={!isOpen} />
      <section
        className={`upsell-modal ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="upsell-inner">
          <div className="upsell-badge">⚡ عرض حصري لطلبك فقط</div>

          <h2 className="upsell-title">
            أضف {offerProduct?.name} لطلبك الحالي بسعر خاص!
          </h2>
          <p className="upsell-sub">
            هذا العرض متاح لمرة واحدة فقط قبل إتمام طلبك — لن يتكرر بعد ذلك.
          </p>

          {offerProduct && (
            <div className="upsell-product-row">
              <img
                className="upsell-product-img"
                src={offerProduct.image}
                alt={offerProduct.name}
              />
              <div>
                <p className="upsell-product-name">{offerProduct.name}</p>
                <p className="upsell-product-benefit">{offerProduct.shortBenefit}</p>
                <div className="upsell-price-row">
                  <span className="upsell-old-price">{offerProduct.price} ر.س</span>
                  <span className="upsell-new-price">{upsellPrice} ر.س</span>
                  <span className="upsell-save">وفّر {offerProduct.price - upsellPrice} ر.س</span>
                </div>
              </div>
            </div>
          )}

          <div className="upsell-timer">
            ينتهي العرض خلال: <span>{secondsLeft}</span> ثانية
          </div>

          <div className="upsell-actions">
            <button
              className="btn btn-gold btn-full btn-lg"
              type="button"
              onClick={handleAccept}
              disabled={accepted}
            >
              {accepted ? "⏳ جاري الإضافة..." : `أضف للطلب — ${upsellPrice} ر.س فقط`}
            </button>
            <button
              className="btn btn-ghost btn-full"
              type="button"
              onClick={onReject}
            >
              لا شكراً، أكمل بدونه
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
