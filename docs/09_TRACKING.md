# 09 — Tracking System (Pixels + CAPI)

> Full multi-platform tracking with deduplication.
> Web pixels: no hashing. CAPI server-side: SHA-256 hashing required.
> TikTok phone: must include + prefix (E.164 format).
> All pixels use deferred loading for Core Web Vitals performance.

---

## 1. Platform Overview

| Platform | Web Pixel | Server-Side CAPI | Pixel ID Env Var | CAPI Token Env Var |
|----------|-----------|-----------------|------------------|--------------------|
| Meta (Facebook/Instagram) | ✅ | ✅ | `NEXT_PUBLIC_META_PIXEL_ID` | `META_CAPI_ACCESS_TOKEN` |
| TikTok | ✅ | ✅ | `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | `TIKTOK_CAPI_ACCESS_TOKEN` |
| Snapchat | ✅ | ✅ | `NEXT_PUBLIC_SNAP_PIXEL_ID` | `SNAP_CAPI_ACCESS_TOKEN` |

---

## 2. Deduplication Architecture

Deduplication prevents double-counting events that fire on both web pixel and CAPI.

**Rule:** Every event fired via web pixel AND server-side CAPI must share the same `event_id`.

```
Web Pixel:  PageView → event_id = "pv_abc123"
CAPI:       PageView → event_id = "pv_abc123"  ← same ID, platform deduplicates
```

### Event ID Generation
```typescript
// frontend/lib/tracking.ts
export function generateEventId(prefix: string): string {
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    : Math.random().toString(36).slice(2, 18)
  return `${prefix}_${rand}_${Date.now()}`
}
```

### Event ID Storage
- Generate event_id on the **client** when the event fires
- Send event_id to **backend** with the order payload
- Backend uses the same event_id when firing CAPI

---

## 3. Deferred Loading (Performance Rule)

All pixel scripts must be deferred — never block page render.

```typescript
// frontend/lib/tracking.ts
export function loadPixels(): void {
  if (typeof window === 'undefined') return

  // Use requestIdleCallback for non-critical pixels
  const load = () => {
    initMetaPixel()
    initTikTokPixel()
    initSnapPixel()
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(load, { timeout: 3000 })
  } else {
    setTimeout(load, 1500)
  }
}
```

Call `loadPixels()` once in the root layout after hydration:
```typescript
// app/layout.tsx or _app.tsx
useEffect(() => { loadPixels() }, [])
```

---

## 4. Meta (Facebook) Pixel

### Web Pixel Setup
```typescript
// frontend/lib/pixels/meta.ts
declare global { interface Window { fbq: Function } }

export function initMetaPixel(): void {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  if (!pixelId || typeof window === 'undefined') return

  // Standard Meta Pixel init snippet
  ;(function(f: any, b, e, v, n?: any, t?: any, s?: any) {
    if (f.fbq) return
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []
    t = b.createElement(e); t.async = true
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

  window.fbq('init', pixelId)
  window.fbq('track', 'PageView')
}

// Standard events — NO hashing on web pixel
export function metaTrack(event: string, data: Record<string, any>, eventId: string): void {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', event, data, { eventID: eventId })
}
```

### Meta Event Map

| User Action | Event Name | Key Data |
|-------------|------------|----------|
| Product page view | `ViewContent` | content_ids, content_type, value, currency |
| Add to cart | `AddToCart` | content_ids, value, currency |
| Checkout popup opens | `InitiateCheckout` | value, currency, num_items |
| Order confirmed | `Purchase` | value, currency, content_ids, num_items |

```typescript
// Example: Purchase event
metaTrack('Purchase', {
  value: order.total,
  currency: 'SAR',
  content_ids: order.items.map(i => i.sku),
  content_type: 'product',
  num_items: order.items.reduce((s, i) => s + i.qty, 0),
}, order.eventId)
```

---

## 5. TikTok Pixel

### Web Pixel Setup
```typescript
// frontend/lib/pixels/tiktok.ts
declare global { interface Window { ttq: any } }

export function initTikTokPixel(): void {
  const pixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
  if (!pixelId || typeof window === 'undefined') return

  ;(function(w: any, d, t) {
    w.TiktokAnalyticsObject = t
    const ttq = w[t] = w[t] || []
    ttq.methods = ['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie']
    ttq.setAndDefer = function(t: any, e: any) { t[e] = function() { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }
    for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i])
    ttq.instance = function(t: any) {
      const e = ttq._i[t] || []
      for (let n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n])
      return e
    }
    ttq.load = function(e: any, n: any) {
      const i = 'https://analytics.tiktok.com/i18n/pixel/events.js'
      ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i; ttq._t = ttq._t || {}
      ttq._t[e] = +new Date; ttq._o = ttq._o || {}; ttq._o[e] = n || {}
      const s = d.createElement('script') as HTMLScriptElement
      s.type = 'text/javascript'; s.async = true; s.src = i + '?sdkid=' + e + '&lib=' + t
      const a = d.getElementsByTagName('script')[0]
      a.parentNode!.insertBefore(s, a)
    }
    ttq.load(pixelId)
    ttq.page()
  })(window, document, 'ttq')
}

export function tiktokTrack(event: string, data: Record<string, any>, eventId: string): void {
  if (typeof window === 'undefined' || !window.ttq) return
  window.ttq.track(event, { ...data, event_id: eventId })
}
```

### TikTok Event Map

| User Action | Event Name | Key Data |
|-------------|------------|----------|
| Product page view | `ViewContent` | content_id, content_type, value, currency |
| Add to cart | `AddToCart` | content_id, value, currency, quantity |
| Checkout popup opens | `InitiateCheckout` | value, currency |
| Order confirmed | `PlaceAnOrder` | content_id, value, currency, quantity |

> **Note:** TikTok uses `PlaceAnOrder` (not `Purchase`) for COD stores.

---

## 6. Snapchat Pixel

### Web Pixel Setup
```typescript
// frontend/lib/pixels/snapchat.ts
declare global { interface Window { snaptr: any } }

export function initSnapPixel(): void {
  const pixelId = process.env.NEXT_PUBLIC_SNAP_PIXEL_ID
  if (!pixelId || typeof window === 'undefined') return

  ;(function(e: any, t, n) {
    if (e.snaptr) return
    const a = e.snaptr = function() {
      a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments)
    }
    a.queue = []
    const s = 'script'
    const r = t.createElement(s) as HTMLScriptElement
    r.async = true; r.src = n
    const u = t.getElementsByTagName(s)[0]
    u.parentNode!.insertBefore(r, u)
  })(window, document, 'https://sc-static.net/scevent.min.js')

  window.snaptr('init', pixelId, { user_email: '' })
  window.snaptr('track', 'PAGE_VIEW')
}

export function snapTrack(event: string, data: Record<string, any>): void {
  if (typeof window === 'undefined' || !window.snaptr) return
  window.snaptr('track', event, data)
}
```

### Snapchat Event Map

| User Action | Event Name |
|-------------|------------|
| Product page view | `VIEW_CONTENT` |
| Add to cart | `ADD_CART` |
| Checkout opens | `START_CHECKOUT` |
| Order confirmed | `PURCHASE` |

---

## 7. CAPI — Server-Side Tracking (Backend: FastAPI)

### Hashing Rules (MANDATORY for CAPI)

All PII must be **SHA-256 hashed** before sending to any CAPI endpoint.

```python
# backend/app/services/tracking/hasher.py
import hashlib
import re

def sha256_hash(value: str) -> str:
    """Lowercase, strip, then SHA-256 hash."""
    return hashlib.sha256(value.strip().lower().encode()).hexdigest()

def normalize_saudi_phone(phone: str) -> str:
    """
    Convert Saudi phone to E.164 format for CAPI.
    05XXXXXXXX  →  +966XXXXXXXX
    TikTok REQUIRES the + prefix.
    Meta/Snap also require E.164 without + (966XXXXXXXX).
    """
    phone = re.sub(r'\D', '', phone)   # remove non-digits
    if phone.startswith('05'):
        phone = '966' + phone[1:]      # 966XXXXXXXXX
    elif phone.startswith('5') and len(phone) == 9:
        phone = '966' + phone          # 966XXXXXXXXX
    return phone   # for Meta/Snap: "966XXXXXXXXX"

def normalize_phone_tiktok(phone: str) -> str:
    """TikTok requires + prefix."""
    normalized = normalize_saudi_phone(phone)
    return '+' + normalized   # "+966XXXXXXXXX"

def hash_phone_meta(phone: str) -> str:
    return sha256_hash(normalize_saudi_phone(phone))

def hash_phone_tiktok(phone: str) -> str:
    """TikTok hashes the +966XXXXXXXXX format."""
    return sha256_hash(normalize_phone_tiktok(phone))

def hash_name(name: str) -> str:
    """Hash first name only (first word)."""
    first = name.strip().split()[0] if name.strip() else name
    return sha256_hash(first)
```

### Hashed User Data Object
```python
# backend/app/services/tracking/user_data.py
from .hasher import sha256_hash, hash_phone_meta, hash_phone_tiktok, hash_name

def build_meta_user_data(customer_name: str, phone: str, ip: str = None, ua: str = None) -> dict:
    return {
        "ph": hash_phone_meta(phone),        # SHA-256 hashed E.164 phone
        "fn": hash_name(customer_name),      # SHA-256 hashed first name
        "country": sha256_hash("sa"),        # Saudi Arabia
        "client_ip_address": ip or "",
        "client_user_agent": ua or "",
    }

def build_tiktok_user_data(customer_name: str, phone: str, ip: str = None, ua: str = None) -> dict:
    return {
        "phone_number": hash_phone_tiktok(phone),  # SHA-256 of +966XXXXXXXXX
        "ip": ip or "",
        "user_agent": ua or "",
    }

def build_snap_user_data(customer_name: str, phone: str, ip: str = None) -> dict:
    return {
        "phone": hash_phone_meta(phone),    # SHA-256 hashed E.164 phone
        "country": "SA",
        "ip_address": ip or "",
    }
```

---

## 8. Meta CAPI Implementation

```python
# backend/app/services/tracking/meta_capi.py
import httpx
import os
import time
from .user_data import build_meta_user_data

META_CAPI_URL = "https://graph.facebook.com/v19.0/{pixel_id}/events"

async def send_meta_capi_event(
    event_name: str,
    event_id: str,
    order: dict,
    ip: str = None,
    ua: str = None,
) -> None:
    pixel_id = os.getenv("META_PIXEL_ID")
    access_token = os.getenv("META_CAPI_ACCESS_TOKEN")
    if not pixel_id or not access_token:
        return

    url = META_CAPI_URL.format(pixel_id=pixel_id)
    user_data = build_meta_user_data(order["customer_name"], order["phone"], ip, ua)

    payload = {
        "data": [{
            "event_name": event_name,          # "Purchase"
            "event_time": int(time.time()),
            "event_id": event_id,              # MUST match web pixel event_id
            "action_source": "website",
            "user_data": user_data,
            "custom_data": {
                "value": float(order["total"]),
                "currency": "SAR",
                "content_ids": [i["sku"] for i in order["items"]],
                "content_type": "product",
                "num_items": sum(i["qty"] for i in order["items"]),
            },
        }],
        "access_token": access_token,
        "test_event_code": os.getenv("META_TEST_EVENT_CODE", ""),  # remove in production
    }

    # Remove empty test_event_code
    if not payload.get("test_event_code"):
        payload.pop("test_event_code", None)

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(url, json=payload)
    except Exception:
        pass  # Non-blocking — never fail order submission due to tracking
```

---

## 9. TikTok Events API (CAPI)

```python
# backend/app/services/tracking/tiktok_capi.py
import httpx
import os
import time
from .user_data import build_tiktok_user_data

TIKTOK_CAPI_URL = "https://business-api.tiktok.com/open_api/v1.3/event/track/"

async def send_tiktok_capi_event(
    event_name: str,
    event_id: str,
    order: dict,
    ip: str = None,
    ua: str = None,
) -> None:
    pixel_id = os.getenv("TIKTOK_PIXEL_ID")
    access_token = os.getenv("TIKTOK_CAPI_ACCESS_TOKEN")
    if not pixel_id or not access_token:
        return

    user_data = build_tiktok_user_data(order["customer_name"], order["phone"], ip, ua)

    payload = {
        "pixel_code": pixel_id,
        "event": event_name,              # "PlaceAnOrder"
        "event_id": event_id,             # MUST match web pixel event_id
        "timestamp": str(int(time.time())),
        "context": {
            "user": user_data,
            "page": {"url": "https://nidhamauto.shop"},
        },
        "properties": {
            "value": str(float(order["total"])),
            "currency": "SAR",
            "content_id": order["items"][0]["sku"] if order["items"] else "",
            "content_type": "product",
            "quantity": str(sum(i["qty"] for i in order["items"])),
        },
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(
                TIKTOK_CAPI_URL,
                headers={"Access-Token": access_token, "Content-Type": "application/json"},
                json=payload,
            )
    except Exception:
        pass
```

---

## 10. Snapchat Conversions API

```python
# backend/app/services/tracking/snap_capi.py
import httpx
import os
import time
import uuid
from .user_data import build_snap_user_data

SNAP_CAPI_URL = "https://tr.snapchat.com/v2/conversion"

async def send_snap_capi_event(
    event_name: str,
    event_id: str,
    order: dict,
    ip: str = None,
    ua: str = None,
) -> None:
    pixel_id = os.getenv("SNAP_PIXEL_ID")
    access_token = os.getenv("SNAP_CAPI_ACCESS_TOKEN")
    if not pixel_id or not access_token:
        return

    user_data = build_snap_user_data(order["customer_name"], order["phone"], ip)

    payload = {
        "pixel_id": pixel_id,
        "timestamp": str(int(time.time() * 1000)),  # milliseconds
        "event_conversion_type": "WEB",
        "event_type": event_name,            # "PURCHASE"
        "event_tag": event_id,               # deduplication key
        "hashed_phone_number": user_data["phone"],
        "price": float(order["total"]),
        "currency": "SAR",
        "number_items": str(sum(i["qty"] for i in order["items"])),
        "client_dedup_id": event_id,
        "ip_address": ip or "",
        "user_agent": ua or "",
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(
                SNAP_CAPI_URL,
                headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
                json=payload,
            )
    except Exception:
        pass
```

---

## 11. Backend Tracking Orchestrator

Fire all 3 CAPIs simultaneously after order is saved:

```python
# backend/app/services/tracking/orchestrator.py
import asyncio
from .meta_capi import send_meta_capi_event
from .tiktok_capi import send_tiktok_capi_event
from .snap_capi import send_snap_capi_event

async def fire_all_capi(order: dict, event_id: str, ip: str = None, ua: str = None) -> None:
    """
    Fire Meta, TikTok, Snapchat CAPI in parallel.
    Never raises — tracking must never block order response.
    """
    await asyncio.gather(
        send_meta_capi_event("Purchase", event_id, order, ip, ua),
        send_tiktok_capi_event("PlaceAnOrder", event_id, order, ip, ua),
        send_snap_capi_event("PURCHASE", event_id, order, ip, ua),
        return_exceptions=True,   # suppress all tracking errors
    )
```

### Call from Order Router
```python
# backend/app/routers/orders.py — inside POST /api/orders
import asyncio
from app.services.tracking.orchestrator import fire_all_capi

@router.post("/api/orders")
async def create_order(order: OrderCreate, request: Request, background_tasks: BackgroundTasks):
    # 1. Validate + save to DB
    saved_order = await order_service.create(order)

    # 2. Forward to Google Sheets webhook
    background_tasks.add_task(webhook_service.send, saved_order)

    # 3. Fire all CAPI in background (non-blocking)
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    background_tasks.add_task(fire_all_capi, saved_order.dict(), order.event_id, ip, ua)

    return {"success": True, "order_number": saved_order.order_number}
```

---

## 12. Frontend: Unified Tracking Module

```typescript
// frontend/lib/tracking.ts

import { metaTrack } from './pixels/meta'
import { tiktokTrack } from './pixels/tiktok'
import { snapTrack } from './pixels/snapchat'

export function generateEventId(prefix: string): string {
  const uid = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    : Math.random().toString(36).slice(2)
  return `${prefix}_${uid}_${Date.now()}`
}

// --- Events ---

export function trackViewContent(product: { sku: string; price: number }): void {
  const eventId = generateEventId('vc')
  metaTrack('ViewContent', { content_ids: [product.sku], value: product.price, currency: 'SAR', content_type: 'product' }, eventId)
  tiktokTrack('ViewContent', { content_id: product.sku, value: product.price, currency: 'SAR' }, eventId)
  snapTrack('VIEW_CONTENT', { price: product.price, currency: 'SAR', item_ids: [product.sku] })
}

export function trackAddToCart(product: { sku: string; price: number }): void {
  const eventId = generateEventId('atc')
  metaTrack('AddToCart', { content_ids: [product.sku], value: product.price, currency: 'SAR' }, eventId)
  tiktokTrack('AddToCart', { content_id: product.sku, value: product.price, currency: 'SAR' }, eventId)
  snapTrack('ADD_CART', { price: product.price, currency: 'SAR', item_ids: [product.sku] })
}

export function trackInitiateCheckout(total: number): void {
  const eventId = generateEventId('ic')
  metaTrack('InitiateCheckout', { value: total, currency: 'SAR' }, eventId)
  tiktokTrack('InitiateCheckout', { value: total, currency: 'SAR' }, eventId)
  snapTrack('START_CHECKOUT', { price: total, currency: 'SAR' })
}

export function trackPurchase(order: {
  eventId: string
  total: number
  items: Array<{ sku: string; qty: number }>
}): void {
  // eventId was generated on order confirmation → same ID sent to CAPI via backend
  metaTrack('Purchase', {
    value: order.total,
    currency: 'SAR',
    content_ids: order.items.map(i => i.sku),
    content_type: 'product',
    num_items: order.items.reduce((s, i) => s + i.qty, 0),
  }, order.eventId)

  tiktokTrack('PlaceAnOrder', {
    content_id: order.items[0]?.sku,
    value: order.total,
    currency: 'SAR',
    quantity: order.items.reduce((s, i) => s + i.qty, 0),
  }, order.eventId)

  snapTrack('PURCHASE', {
    price: order.total,
    currency: 'SAR',
    item_ids: order.items.map(i => i.sku),
    number_items: order.items.reduce((s, i) => s + i.qty, 0),
  })
}
```

---

## 13. Environment Variables (Tracking)

### Frontend (.env.local)
```env
NEXT_PUBLIC_META_PIXEL_ID=YOUR_META_PIXEL_ID
NEXT_PUBLIC_TIKTOK_PIXEL_ID=YOUR_TIKTOK_PIXEL_ID
NEXT_PUBLIC_SNAP_PIXEL_ID=YOUR_SNAP_PIXEL_ID
```

### Backend (.env)
```env
META_PIXEL_ID=YOUR_META_PIXEL_ID
META_CAPI_ACCESS_TOKEN=YOUR_META_CAPI_TOKEN
META_TEST_EVENT_CODE=TEST12345

TIKTOK_PIXEL_ID=YOUR_TIKTOK_PIXEL_ID
TIKTOK_CAPI_ACCESS_TOKEN=YOUR_TIKTOK_CAPI_TOKEN

SNAP_PIXEL_ID=YOUR_SNAP_PIXEL_ID
SNAP_CAPI_ACCESS_TOKEN=YOUR_SNAP_CAPI_TOKEN
```

---

## 14. Deduplication Checklist

- [ ] `event_id` generated on client at moment of event
- [ ] `event_id` passed with web pixel fire (all 3 platforms)
- [ ] `event_id` included in order payload sent to backend
- [ ] Backend stores `event_id` on order record
- [ ] Backend uses same `event_id` when firing CAPI
- [ ] TikTok phone hashed from `+966XXXXXXXXX` format (with + prefix)
- [ ] Meta/Snap phone hashed from `966XXXXXXXXX` format (no + prefix)
- [ ] All PII SHA-256 hashed before CAPI — never send plaintext
- [ ] Tracking errors never block order response (use background_tasks)
- [ ] Pixels loaded deferred (requestIdleCallback or setTimeout 1500ms)
