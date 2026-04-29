import { useEffect, useMemo, useState } from "react";
import { getActiveCopy } from "../content/copyByVariant";
import { getUpsellPrice } from "../lib/pricing";

export default function UpsellOfferModal({
  isOpen,
  offerProduct,
  countdownSeconds = 12,
  onAccept,
  onReject,
}) {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const upsellPrice = getUpsellPrice();
  const copy = getActiveCopy();

  useEffect(() => {
    if (!isOpen) return undefined;
    setSecondsLeft(countdownSeconds);
    return undefined;
  }, [isOpen, countdownSeconds]);

  useEffect(() => {
    if (!isOpen) return undefined;
    if (secondsLeft <= 0) {
      onReject();
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isOpen, secondsLeft, onReject]);

  const headline = useMemo(() => {
    if (!offerProduct) return "";
    return copy.upsell.headline(offerProduct.name);
  }, [offerProduct, copy]);

  return (
    <>
      <div className={`popup-overlay ${isOpen ? "visible" : ""}`} aria-hidden={!isOpen} />
      <section className={`upsell-modal ${isOpen ? "open" : ""}`}>
        <div className="upsell-shell">
          <p className="upsell-badge">{copy.upsell.badge}</p>
          <h2>{headline}</h2>
          <p className="muted">{copy.upsell.description(upsellPrice)}</p>

          {offerProduct && (
            <article className="upsell-product">
              <img src={offerProduct.image} alt={offerProduct.name} />
              <div>
                <strong>{offerProduct.name}</strong>
                <p>{offerProduct.shortBenefit}</p>
                <div className="upsell-price-row">
                  <span className="strikethrough">{offerProduct.price} SAR</span>
                  <strong>{upsellPrice} SAR</strong>
                </div>
              </div>
            </article>
          )}

          <p className="upsell-timer">{copy.upsell.timer(secondsLeft)}</p>

          <div className="upsell-actions">
            <button className="primary-btn" type="button" onClick={onAccept}>
              أضف إلى طلبي
            </button>
            <button className="ghost-btn" type="button" onClick={onReject}>
              لا، شكرًا
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
