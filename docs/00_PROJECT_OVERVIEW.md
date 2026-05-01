# 00 — Project Overview & Locked Configuration

> **Single source of truth.** Every AI coder working on this project must read this file first.
> Do not deviate from locked decisions without explicit owner approval.

---

## 1. What We Are Building

A **premium Arabic-first DTC (Direct-To-Consumer) dropshipping store** targeting Saudi Arabian drivers.

The store presents as an owned brand — not a reseller. It sells three automotive comfort products at a premium price point via **Cash-On-Delivery (COD)**, the dominant payment method in KSA.

---

## 2. Locked Business Decisions

| Parameter | Locked Value |
|-----------|-------------|
| Brand Name (EN) | `Nidham Auto` |
| Brand Name (AR) | `نظام أوتو` |
| Short Arabic Name | `نِظام` |
| Primary Domain | `nidhamauto.shop` |
| Brand Tagline (EN) | "Order your drive. Calm your day." |
| Brand Tagline (AR) | "نظّم قيادتك. اهدأ يومك." |
| Market | Saudi Arabia (KSA) |
| Language | Arabic (RTL) — primary. English only in code/metadata |
| Currency | SAR (Saudi Riyal) |
| Payment Method | Cash on Delivery (COD) only — no online payments |
| Niche | Automotive daily comfort & driving solutions |
| Model | Dropshipping (presented as owned brand) |
| Target Audience | Saudi drivers — primary focus: Saudi women drivers |

---

## 3. Products (Locked SKUs)

### Product 1 — Phone Mount
| Field | Value |
|-------|-------|
| ID | `phone-mount` |
| SKU | `NA-PM-001` |
| Arabic Name | حامل مغناطيسي بثبات AeroLock لحل مشكلة سقوط الجوال أثناء الملاحة |
| Short Arabic Name | المثبّت المغناطيسي الذكي |
| Pain Solved | Phone instability + distraction while driving |
| Price (single) | 199 SAR |

### Product 2 — SeatGap Organizer
| Field | Value |
|-------|-------|
| ID | `seatgap-organizer` |
| SKU | `NA-SG-001` |
| Arabic Name | منظم حاجز فتحة المقعد بتصميم FlexSeal لحل مشكلة ضياع الأغراض |
| Short Arabic Name | حامي فراغ المقعد FlexSeal |
| Pain Solved | Losing items in seat gap every day |
| Price (single) | 199 SAR |

### Product 3 — Parking Mirror Kit
| Field | Value |
|-------|-------|
| ID | `parking-mirror-kit` |
| SKU | `NA-PK-001` |
| Arabic Name | طقم مرايا Precision View بعدسة واسعة لحل قلق الاصطفاف |
| Short Arabic Name | طقم مرايا Precision View |
| Pain Solved | Blind-spot anxiety and parking stress |
| Price (single) | 199 SAR |

---

## 4. Pricing Rules (Mandatory — All Pages)

| Quantity | Price (SAR) | Label |
|----------|-------------|-------|
| 1 unit | 199 SAR | — |
| 2 units | 279 SAR | وفّر 119 ر.س |
| 3 units | 349 SAR | وفّر 248 ر.س |
| 4 units | 548 SAR (349+199) | — |
| 5 units | 628 SAR (349+279) | — |

**Upsell-only price:** 99 SAR (post-checkout upsell step only — never shown elsewhere)

### Cross-Sell Map
```
phone-mount        → [seatgap-organizer, parking-mirror-kit]
seatgap-organizer  → [phone-mount, parking-mirror-kit]
parking-mirror-kit → [phone-mount, seatgap-organizer]
```

---

## 5. Tech Stack (Locked)

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** React 18+
- **Styling:** TailwindCSS 3+ (RTL plugin enabled)
- **State Management:** Zustand
- **Language:** TypeScript

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **ORM:** SQLAlchemy + Alembic (migrations)
- **Validation:** Pydantic v2

### Database
- **Engine:** PostgreSQL
- **Connection:** `postgres://nidhamauto:nidhamauto@nidhamauto_database:5432/nidhamauto?sslmode=disable`

### Infrastructure
- **Server:** Easypanel (already provisioned)
- **PostgreSQL:** Already installed on Easypanel
- **Frontend deploy:** Easypanel → Next.js app
- **Backend deploy:** Easypanel → FastAPI app (Uvicorn)

---

## 6. Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=https://nidhamauto.shop
NEXT_PUBLIC_META_PIXEL_ID=YOUR_PIXEL_ID
NEXT_PUBLIC_TIKTOK_PIXEL_ID=YOUR_TIKTOK_ID
```

### Backend (.env)
```env
DATABASE_URL=postgres://nidhamauto:nidhamauto@nidhamauto_database:5432/nidhamauto?sslmode=disable
WEBHOOK_URL=YOUR_GOOGLE_SHEETS_WEBHOOK_URL
CORS_ORIGINS=https://nidhamauto.shop,http://localhost:3000
SECRET_KEY=your_secret_key_here
```

---

## 7. Required Pages

| Page | Route | Priority |
|------|-------|----------|
| Home | `/` | Critical |
| Collection / Shop | `/shop` | Critical |
| Product — Phone Mount | `/products/phone-mount` | Critical |
| Product — SeatGap Organizer | `/products/seatgap-organizer` | Critical |
| Product — Parking Mirror Kit | `/products/parking-mirror-kit` | Critical |
| Thank You | `/thank-you` | Critical |
| Contact | `/contact` | High |
| Shipping Policy | `/policies/shipping` | High |
| Return & Refund Policy | `/policies/returns` | High |
| Privacy Policy | `/policies/privacy` | High |
| Terms of Service | `/policies/terms` | High |
| COD Policy | `/policies/cod` | High |

---

## 8. Core User Flow (Locked)

```
1. Land on Home / Shop / Product page
2. Click "اشتري الآن" (Buy Now)
3. Product added → Cart Drawer opens
4. Cart Drawer shows cross-sell items
5. Click "إتمام الطلب" (Proceed to Checkout)
6. COD Checkout Popup opens (Name + Phone only)
7. Validation passes
8. User clicks "تأكيد طلبي" (Confirm Order)
9. Upsell modal appears (99 SAR — 12 second countdown)
10. User accepts or rejects (or timeout → auto-reject)
11. Final order POSTed to /api/orders
12. Backend forwards to Google Sheets webhook
13. Redirect to /thank-you
```

---

## 9. No-Go List (Never Do)

- ❌ No online payment gateway (Mada, STCPay, etc.) — COD only
- ❌ No WhatsApp button or integration
- ❌ No SMS integration
- ❌ No quiz funnels
- ❌ No subscription model
- ❌ No fake lab certifications or fabricated badges
- ❌ No cart page (cart drawer only)
- ❌ No multi-language toggle (Arabic only for users)
- ❌ No external font that doesn't support Arabic
- ❌ Do not expose webhook URL on the client side

---

## 10. Docs Index

| File | Purpose |
|------|---------|
| `00_PROJECT_OVERVIEW.md` | This file — master config |
| `01_ARCHITECTURE.md` | Folder structure, DB schema, API routes |
| `02_DESIGN_SYSTEM.md` | Colors, typography, RTL, components |
| `03_BRAND_POSITIONING.md` | Brand identity, voice, messaging |
| `04_ICP.md` | Ideal Customer Profile — Saudi women drivers |
| `05_COPYWRITING.md` | All Arabic copy for every page |
| `06_CRO.md` | Conversion optimization, page specs, upsells |
| `07_CODING_RULES.md` | Code standards, RTL rules, performance |
| `08_CONTENT_AUTHORITY.md` | Social proof, trust stack, certifications |
