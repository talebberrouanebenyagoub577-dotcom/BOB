"use client";

// ─── Type declarations for browser pixels ────────────────────────────────────
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, data?: object) => void };
    snaptr?: (action: string, event: string, data?: object) => void;
  }
}

type PixelEventData = {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  event_id?: string;
};

function fb(event: string, data?: PixelEventData) {
  try { window.fbq?.("track", event, data ?? {}, data?.event_id ? { eventID: data.event_id } : {}); }
  catch { /* silently swallow */ }
}

function tt(event: string, data?: PixelEventData) {
  try { window.ttq?.track(event, data ?? {}); }
  catch { /* silently swallow */ }
}

function snap(event: string, data?: PixelEventData) {
  try { window.snaptr?.("track", event, data ?? {}); }
  catch { /* silently swallow */ }
}

export function trackPageView() {
  fb("PageView");
  tt("Pageview");
  snap("PAGE_VIEW");
}

export function trackViewContent(productId: string, value: number) {
  const data = { content_ids: [productId], content_type: "product", value, currency: "SAR" };
  fb("ViewContent", data);
  tt("ViewContent", data);
  snap("VIEW_CONTENT", data);
}

export function trackAddToCart(productId: string, value: number) {
  const data = { content_ids: [productId], content_type: "product", value, currency: "SAR" };
  fb("AddToCart", data);
  tt("AddToCart", data);
  snap("ADD_CART", data);
}

export function trackInitiateCheckout(value: number) {
  const data = { value, currency: "SAR" };
  fb("InitiateCheckout", data);
  tt("InitiateCheckout", data);
  snap("START_CHECKOUT", data);
}

export function trackPurchase(eventId: string, value: number, skus: string[]) {
  const data = { event_id: eventId, value, currency: "SAR", content_ids: skus, content_type: "product" };
  fb("Purchase", data);
  tt("CompletePayment", data);
  snap("PURCHASE", data);
}

/** Deferred pixel loader — never blocks render */
export function loadPixels() {
  const load = () => {
    const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const ttId   = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
    const snapId = process.env.NEXT_PUBLIC_SNAP_PIXEL_ID;

    if (metaId) {
      const s = document.createElement("script");
      s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaId}');fbq('track','PageView');`;
      document.head.appendChild(s);
    }
    if (ttId) {
      const s = document.createElement("script");
      s.src = "https://analytics.tiktok.com/i18n/pixel/events.js";
      s.async = true;
      s.onload = () => {
        (window as Window & { ttq?: { load: (id: string) => void; page: () => void } }).ttq?.load(ttId);
        (window as Window & { ttq?: { load: (id: string) => void; page: () => void } }).ttq?.page();
      };
      document.head.appendChild(s);
    }
    if (snapId) {
      const s = document.createElement("script");
      s.innerHTML = `(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init','${snapId}');snaptr('track','PAGE_VIEW');`;
      document.head.appendChild(s);
    }
  };

  if ("requestIdleCallback" in window) {
    requestIdleCallback(load, { timeout: 2000 });
  } else {
    setTimeout(load, 1500);
  }
}
