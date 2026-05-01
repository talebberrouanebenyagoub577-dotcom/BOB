# 07 — Coding Rules & Standards

> These rules are non-negotiable for this project.
> Any AI or developer contributing code must read and follow this file.

---

## 1. General Principles

1. **Correctness before cleverness** — Write obvious, readable code
2. **Mobile-first, RTL-first** — Every component is built for mobile + Arabic first
3. **TypeScript strictly typed** — No `any` types; use proper interfaces and Pydantic models
4. **Single responsibility** — Each component/function does one thing
5. **No dead code** — If it's not used, delete it
6. **Environment variables** — Never hardcode secrets or URLs; use `.env` always

---

## 2. Frontend Stack Rules

### Technology Versions (Minimum)
```
next: ^14.0.0
react: ^18.3.0
typescript: ^5.0.0
tailwindcss: ^3.4.0
zustand: ^4.5.0
```

### File Structure Rules
- Pages go in `app/` (Next.js App Router)
- Reusable UI components go in `components/ui/`
- Feature-specific components go in `components/[feature]/`
- Global state goes in `store/`
- API functions go in `lib/`
- Static data goes in `data/`
- TypeScript types go in `types/`

### File Naming
```
Components:   PascalCase  →  ProductCard.tsx
Pages:        lowercase   →  page.tsx (Next.js convention)
Utilities:    camelCase   →  pricing.ts
Types:        camelCase   →  product.ts
Stores:       camelCase   →  cartStore.ts
Constants:    UPPER_CASE  →  PRODUCTS array in data/products.ts
```

---

## 3. RTL / Arabic Rules

### HTML Root (Never change)
```tsx
// app/layout.tsx — always
<html lang="ar" dir="rtl">
```

### Text Alignment
```tsx
// Default: text goes right in Arabic
className="text-right"

// Only override for numbers/latin content
<span dir="ltr" className="text-left">199</span>
```

### Phone Input (Special case)
```tsx
// Phone numbers are LTR even in Arabic UI
<input
  type="tel"
  dir="ltr"
  className="text-left tracking-wider"
  placeholder="05XXXXXXXX"
/>
```

### Flexbox in RTL
```tsx
// ✅ Correct: use flex-row-reverse when visual order must flip
<div className="flex flex-row-reverse items-center gap-3">

// ✅ Or use logical CSS via Tailwind RTL plugin:
<div className="flex items-center gap-3 rtl:flex-row-reverse">
```

### Icons That Point a Direction
```tsx
// Arrows, chevrons — must flip in RTL
<ChevronRightIcon className="rtl:rotate-180" />

// Or use scale:
<ArrowRightIcon className="rtl:scale-x-[-1]" />
```

### Cart Drawer (RTL Positioning)
```tsx
// Opens from the RIGHT side in RTL layout
// Translates from right, not left
<div className={`fixed top-0 right-0 h-full w-80
                 transform transition-transform duration-250
                 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
```

---

## 4. Component Authoring Rules

### Every Component Must:
- [ ] Be typed with TypeScript interfaces (no inline `any`)
- [ ] Be mobile-first in styling
- [ ] Handle RTL correctly
- [ ] Accept all required props explicitly (no prop drilling through unrelated components)
- [ ] Have a clear single responsibility

### Props Interface Pattern
```typescript
interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  className?: string
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  // ...
}
```

### No Inline Styles
```tsx
// ❌ Never
<div style={{ color: '#C9962A', fontSize: '24px' }}>

// ✅ Always
<div className="text-brand-gold text-2xl">
```

### No Hardcoded Strings in JSX
```tsx
// ❌ Never
<button>اشتري الآن</button>

// ✅ Import from copy data
import { COPY } from '@/data/copy'
<button>{COPY.cta.buyNow}</button>
```

---

## 5. State Management Rules (Zustand)

```typescript
// Store pattern — always use this structure
import { create } from 'zustand'

interface CartState {
  items: CartItem[]
  addItem: (product: Product) => void
  // ...
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product) => set((state) => ({
    items: [...state.items, { ...product, quantity: 1 }]
  })),
  // ...
}))
```

- Never mutate state directly — always return new state
- Keep stores small and focused
- Don't persist sensitive data to localStorage

---

## 6. API / Data Fetching Rules

### Order Submission
```typescript
// lib/orderApi.ts
export async function submitOrder(payload: OrderPayload): Promise<OrderResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'فشل إرسال الطلب')
  }

  return res.json()
}
```

### Idempotency Key (Generate Once Per Checkout)
```typescript
// lib/idempotency.ts
import { v4 as uuidv4 } from 'uuid'

export function generateIdempotencyKey(): string {
  return uuidv4()
}
```

### Never Call Backend from Client with Secrets
- Use Next.js Server Actions or API routes as proxy for sensitive calls
- Webhook URL stays in backend `.env` only — never exposed to frontend

---

## 7. Pricing Logic (Canonical Implementation)

This must be identical in frontend and backend:

```typescript
// frontend/lib/pricing.ts
const PRICING_TIERS: Record<number, number> = {
  1: 199,
  2: 279,
  3: 349,
}

export function calculatePrice(quantity: number): number {
  let total = 0
  let remaining = quantity

  while (remaining > 0) {
    const chunk = Math.min(remaining, 3)
    total += PRICING_TIERS[chunk]
    remaining -= chunk
  }

  return total
}

export function getPricingLabel(quantity: number): string {
  if (quantity === 1) return '199 ر.س'
  if (quantity === 2) return '279 ر.س — وفّر 119 ر.س'
  if (quantity >= 3) return '349 ر.س — وفّر 248 ر.س'
  return ''
}
```

```python
# backend/app/services/order_service.py
PRICING_TIERS = {1: 199, 2: 279, 3: 349}

def calculate_price(quantity: int) -> float:
    total = 0
    remaining = quantity
    while remaining > 0:
        chunk = min(remaining, 3)
        total += PRICING_TIERS[chunk]
        remaining -= chunk
    return float(total)
```

---

## 8. Backend (FastAPI) Rules

### Pydantic Schemas (Required)
```python
# schemas/order.py
from pydantic import BaseModel, validator
import re

class OrderItemCreate(BaseModel):
    product_id: str
    sku: str
    name_ar: str
    quantity: int
    unit_price: float

class OrderCreate(BaseModel):
    customer_name: str
    phone: str
    items: list[OrderItemCreate]
    upsell_offered: bool
    upsell_product: str | None
    upsell_accepted: bool
    upsell_price: float
    source_page: str | None
    utm_source: str | None
    utm_medium: str | None
    utm_campaign: str | None
    idempotency_key: str

    @validator('phone')
    def validate_saudi_phone(cls, v):
        if not re.match(r'^05\d{8}$', v):
            raise ValueError('رقم الجوال غير صحيح')
        return v

    @validator('customer_name')
    def validate_name(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError('الاسم قصير جداً')
        return v
```

### CORS Configuration
```python
# main.py
from fastapi.middleware.cors import CORSMiddleware
import os

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### Error Handling
```python
# Return Arabic error messages in API responses
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": "بيانات غير صحيحة", "errors": exc.errors()}
    )
```

---

## 9. Validation Rules (Both Frontend + Backend)

| Field | Rule | Error Message (AR) |
|-------|------|-------------------|
| customer_name | Required, min 2 chars, not all-numeric | "الاسم مطلوب ويجب أن يحتوي على حرفين على الأقل" |
| phone | Required, matches `^05\d{8}$` | "رقم الجوال غير صحيح — يجب أن يبدأ بـ 05" |
| items | Required, min 1 item, qty > 0 | "يجب إضافة منتج واحد على الأقل" |
| idempotency_key | Required, valid UUID | (internal, not shown to user) |

---

## 10. Security Rules

- Never log full phone numbers — mask them in logs: `05xxxxx78`
- Never expose `WEBHOOK_URL` in frontend code
- Set `httpOnly` cookies if using sessions (not required for this project)
- Validate and sanitize ALL inputs server-side (Pydantic does this)
- Use HTTPS in production (Easypanel handles SSL)
- Rate limit `POST /api/orders` — max 5 requests per IP per minute

---

## 11. Performance Rules

```typescript
// Always use next/image
import Image from 'next/image'
<Image
  src="/images/products/phone-mount.webp"
  alt="المثبّت المغناطيسي الذكي"
  width={480}
  height={360}
  priority={isAboveFold}  // true for hero/first product image only
/>

// Lazy load below-fold images (default for next/image)
// Don't add priority to every image
```

### Bundle Size Rules
- No heavy icon libraries (only import what you use)
- No heavy animation libraries (use CSS transitions)
- Dynamic import for modals/popups:

```typescript
import dynamic from 'next/dynamic'

const CheckoutPopup = dynamic(() => import('@/components/checkout/CheckoutPopup'), {
  ssr: false,
})
```

---

## 12. Accessibility Rules (A11y)

- All interactive elements must have `aria-label` in Arabic
- Images must have Arabic `alt` text
- Form fields must have visible `<label>` elements
- Color contrast ratio: minimum 4.5:1 for body text, 3:1 for large text
- Keyboard navigation must work (popup closable with Escape)
- Loading states must announce to screen readers (`aria-live="polite"`)

---

## 13. Git Conventions

### Branch Names
```
feature/product-page-phone-mount
fix/checkout-phone-validation
style/hero-mobile-layout
```

### Commit Messages
```
feat: add COD checkout popup with phone validation
fix: correct RTL alignment in cart drawer
style: update CTA button to gold color
refactor: extract pricing logic to shared lib
```

### Never Commit
- `.env` files with real secrets
- `node_modules/`
- `.next/` build artifacts
- `__pycache__/`
