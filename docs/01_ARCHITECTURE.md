# 01 — Technical Architecture

---

## 1. Monorepo Structure

```
nidhamauto/
├── frontend/                  # Next.js 14 App Router
│   ├── app/
│   │   ├── layout.tsx          # Root layout — RTL, Arabic font, Meta Pixel
│   │   ├── page.tsx            # Home page
│   │   ├── shop/
│   │   │   └── page.tsx        # Collection page
│   │   ├── products/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx    # Dynamic product page
│   │   ├── thank-you/
│   │   │   └── page.tsx        # Order confirmation
│   │   ├── contact/
│   │   │   └── page.tsx        # Contact form
│   │   └── policies/
│   │       ├── shipping/page.tsx
│   │       ├── returns/page.tsx
│   │       ├── privacy/page.tsx
│   │       ├── terms/page.tsx
│   │       └── cod/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── CartDrawer.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ProductBenefits.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── CrossSellSection.tsx
│   │   │   └── ProductFAQ.tsx
│   │   ├── checkout/
│   │   │   ├── CheckoutPopup.tsx
│   │   │   ├── UpsellModal.tsx
│   │   │   └── OrderSummary.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── PainPointStrip.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   ├── TrustSection.tsx
│   │   │   ├── SocialProofBlock.tsx
│   │   │   └── HomeFAQ.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       ├── TrustChip.tsx
│   │       ├── CountdownTimer.tsx
│   │       ├── StarRating.tsx
│   │       └── Modal.tsx
│   ├── lib/
│   │   ├── pricing.ts          # Pricing tier calculation
│   │   ├── orderApi.ts         # API calls to FastAPI backend
│   │   ├── analytics.ts        # Meta Pixel + TikTok Pixel events
│   │   ├── validation.ts       # Phone + name validation
│   │   └── idempotency.ts      # Idempotency key generation
│   ├── store/
│   │   ├── cartStore.ts        # Zustand cart state
│   │   └── checkoutStore.ts    # Zustand checkout step state
│   ├── data/
│   │   ├── products.ts         # Product definitions
│   │   ├── copy.ts             # All Arabic copy strings
│   │   └── policies.ts         # Policy page content
│   ├── types/
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── cart.ts
│   ├── public/
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   └── products/
│   │   └── fonts/
│   ├── .env.local
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                   # FastAPI Python
│   ├── app/
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── config.py           # Settings from env vars
│   │   ├── database.py         # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   ├── order.py        # SQLAlchemy Order model
│   │   │   └── order_item.py   # SQLAlchemy OrderItem model
│   │   ├── schemas/
│   │   │   ├── order.py        # Pydantic request/response schemas
│   │   │   └── webhook.py      # Webhook payload schema
│   │   ├── routers/
│   │   │   ├── orders.py       # POST /api/orders
│   │   │   └── health.py       # GET /health
│   │   └── services/
│   │       ├── order_service.py    # Business logic
│   │       └── webhook_service.py  # Google Sheets webhook forwarding
│   ├── alembic/               # DB migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env
│
└── docs/                      # This folder
```

---

## 2. Database Schema (PostgreSQL)

### Table: `orders`

```sql
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number    VARCHAR(20) UNIQUE NOT NULL,  -- e.g. "NA-20260501-0001"
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    customer_name   VARCHAR(100) NOT NULL,
    phone           VARCHAR(15) NOT NULL,          -- Saudi format: 05XXXXXXXX
    source_page     VARCHAR(200),
    utm_source      VARCHAR(100),
    utm_medium      VARCHAR(100),
    utm_campaign    VARCHAR(200),
    pricing_tier    VARCHAR(20) NOT NULL,          -- "1-unit", "2-unit", "3-unit", "mixed"
    subtotal        NUMERIC(10,2) NOT NULL,
    upsell_offered  BOOLEAN NOT NULL DEFAULT false,
    upsell_product  VARCHAR(50),                   -- SKU or null
    upsell_accepted BOOLEAN NOT NULL DEFAULT false,
    upsell_price    NUMERIC(10,2) NOT NULL DEFAULT 0,
    total           NUMERIC(10,2) NOT NULL,
    idempotency_key VARCHAR(64) UNIQUE NOT NULL,
    webhook_sent    BOOLEAN NOT NULL DEFAULT false,
    webhook_retries INT NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','cancelled','fulfilled'))
);
```

### Table: `order_items`

```sql
CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  VARCHAR(50) NOT NULL,
    sku         VARCHAR(50) NOT NULL,
    name_ar     VARCHAR(200) NOT NULL,
    quantity    INT NOT NULL CHECK (quantity > 0),
    unit_price  NUMERIC(10,2) NOT NULL,
    line_total  NUMERIC(10,2) NOT NULL
);
```

### Indexes

```sql
CREATE INDEX idx_orders_phone ON orders(phone);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

---

## 3. API Routes

### Backend (FastAPI — base: `/api`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/health` | Health check |
| POST | `/api/orders` | Create new COD order + trigger webhook |
| GET | `/api/orders/{order_number}` | Retrieve order by order number |

---

## 4. POST /api/orders — Full Spec

### Request Body (JSON)

```json
{
  "customer_name": "نورة العمري",
  "phone": "0512345678",
  "items": [
    {
      "product_id": "phone-mount",
      "sku": "NA-PM-001",
      "name_ar": "المثبّت المغناطيسي الذكي",
      "quantity": 1,
      "unit_price": 199.00
    }
  ],
  "upsell_offered": true,
  "upsell_product": "NA-SG-001",
  "upsell_accepted": false,
  "upsell_price": 0,
  "source_page": "/products/phone-mount",
  "utm_source": "tiktok",
  "utm_medium": "paid",
  "utm_campaign": "phone_mount_v1",
  "idempotency_key": "uuid-generated-on-client"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "order_number": "NA-20260501-0001",
  "message": "تم استلام طلبك بنجاح"
}
```

### Error Responses

| Code | Meaning |
|------|---------|
| 400 | Validation error (bad phone, missing fields) |
| 409 | Duplicate idempotency key (order already exists) |
| 422 | Pydantic schema validation failure |
| 500 | Webhook failure or DB error |

---

## 5. Webhook Payload (Google Sheets)

Backend sends this JSON to `WEBHOOK_URL` after order is saved:

```json
{
  "order_number": "NA-20260501-0001",
  "created_at": "2026-05-01T01:00:00Z",
  "customer_name": "نورة العمري",
  "phone": "0512345678",
  "items": [
    {
      "sku": "NA-PM-001",
      "name_ar": "المثبّت المغناطيسي الذكي",
      "quantity": 1,
      "unit_price": 199.00,
      "line_total": 199.00
    }
  ],
  "pricing_tier": "1-unit",
  "subtotal": 199.00,
  "upsell_offered": true,
  "upsell_product": "NA-SG-001",
  "upsell_accepted": false,
  "upsell_price": 0,
  "total": 199.00,
  "source_page": "/products/phone-mount",
  "utm_source": "tiktok",
  "utm_medium": "paid",
  "utm_campaign": "phone_mount_v1"
}
```

**Retry logic:** On non-2xx webhook response → retry up to 3 times with 2s delay. If all fail → set `webhook_retries = 3`, do not block user redirect.

---

## 6. Pricing Calculation Logic

Implement in both `frontend/lib/pricing.ts` and `backend/app/services/order_service.py`:

```
TIERS = { 1: 199, 2: 279, 3: 349 }

function calculatePrice(qty):
  total = 0
  remaining = qty
  while remaining > 0:
    chunk = min(remaining, 3)
    total += TIERS[chunk]
    remaining -= chunk
  return total
```

---

## 7. Frontend Key Behaviours

### Cart State (Zustand)
```typescript
interface CartState {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  totalPrice: () => number
  totalQty: () => number
}
```

### Checkout Flow (Zustand)
```typescript
type CheckoutStep = 'form' | 'upsell' | 'submitting' | 'done'

interface CheckoutState {
  step: CheckoutStep
  customerName: string
  phone: string
  idempotencyKey: string
  upsellAccepted: boolean
  orderNumber: string | null
  setStep: (step: CheckoutStep) => void
  reset: () => void
}
```

### Phone Validation
```typescript
// Must match Saudi mobile format
const SAUDI_PHONE_REGEX = /^05\d{8}$/

function validatePhone(phone: string): boolean {
  return SAUDI_PHONE_REGEX.test(phone)
}
```

---

## 8. Analytics Events

Fire on client side in `frontend/lib/analytics.ts`:

| Event | Trigger |
|-------|---------|
| `PageView` | Every page load |
| `ViewContent` | Product page load |
| `AddToCart` | Buy Now clicked |
| `InitiateCheckout` | Checkout popup opens |
| `Purchase` | Order confirmed (on /thank-you) |

Meta Pixel example:
```typescript
declare const fbq: Function
fbq('track', 'Purchase', {
  value: order.total,
  currency: 'SAR',
  content_ids: order.items.map(i => i.sku),
  content_type: 'product'
})
```

---

## 9. next.config.ts

```typescript
const nextConfig = {
  // RTL direction set in root layout, not here
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },
}
export default nextConfig
```

---

## 10. Root Layout (RTL Setup)

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Cairo Arabic font via Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-cairo bg-white text-gray-900 antialiased">
        <Header />
        <CartDrawer />
        {children}
        <Footer />
      </body>
    </html>
  )
}
```

---

## 11. Deployment (Easypanel)

### Frontend Service
- **Type:** Next.js
- **Build command:** `npm run build`
- **Start command:** `npm run start`
- **Port:** 3000
- **Domain:** nidhamauto.shop

### Backend Service
- **Type:** Python / Docker
- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- **Port:** 8000
- **Internal URL:** `http://backend:8000`

### Database
- Already provisioned on Easypanel
- Connection string in `.env`

### Migrations
Run once on deploy:
```bash
alembic upgrade head
```
