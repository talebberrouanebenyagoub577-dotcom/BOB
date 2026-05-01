# MASTER AI CODER PROMPT
## Nidha Mauto — DTC Store for Saudi Market

> Copy this entire prompt and paste it to your AI coder to start building immediately.
> The prompt references all docs in the /docs folder.
> Fill in the [PLACEHOLDER] values before sending.

---

---
# START OF PROMPT (copy everything below this line)
---

You are building a complete, production-ready DTC (Direct-To-Consumer) e-commerce store called **Nidha Mauto (نيدها اوتو)** targeting Saudi Arabian women drivers.

This is a premium, high-conversion Arabic store. Read every instruction carefully and build exactly as specified. Do not simplify, skip, or assume — build each feature completely.

---

## 0. REFERENCE DOCUMENTS

All project documentation is in the `/docs` folder. You MUST read every doc before writing code:

| Doc | Read for |
|-----|----------|
| `docs/00_PROJECT_OVERVIEW.md` | Brand, products, locked decisions, pricing, pages |
| `docs/01_ARCHITECTURE.md` | Folder structure, DB schema, API routes |
| `docs/02_DESIGN_SYSTEM.md` | Colors, fonts, components, RTL rules |
| `docs/03_BRAND_POSITIONING.md` | Voice, messaging, what to say/not say |
| `docs/04_ICP.md` | Who she is, her psychology, buying journey |
| `docs/05_COPYWRITING.md` | ALL Arabic copy — use exactly as written |
| `docs/06_CRO.md` | Page specs, checkout flow, upsell logic |
| `docs/07_CODING_RULES.md` | TypeScript, RTL, naming, performance rules |
| `docs/08_CONTENT_AUTHORITY.md` | Trust signals, social proof, materials |
| `docs/09_TRACKING.md` | Meta/TikTok/Snap Pixels + CAPI, hashing, deduplication |
| `docs/10_INFRASTRUCTURE.md` | Docker, folder structure, .env.example, domains |
| `docs/11_GOOGLE_SHEETS_WEBHOOK.md` | Webhook JS file, Google Sheets template |
| `docs/12_CRO_SAUDI_WOMEN.md` | Max CRO targeting Saudi women emotions |
| `docs/13_DESIGN_RESPONSIVE.md` | Responsive layout, alternating sections |

---

## 1. WHAT YOU ARE BUILDING

A complete, production-ready DTC store with:

- **Frontend:** Next.js 14 (App Router) + React + TailwindCSS + TypeScript
- **Backend:** FastAPI (Python 3.11) + PostgreSQL + Alembic
- **Tracking:** Meta Pixel + TikTok Pixel + Snapchat Pixel (web) + CAPI server-side for all 3
- **Orders:** COD only → Google Sheets via webhook
- **Infrastructure:** Docker Compose (local) + Easypanel (production)
- **Domain:** `nidhamauto.shop` (frontend + backend)

---

## 2. BRAND IDENTITY (LOCKED — never change)

```
Brand Name (EN):    Nidha Mauto
Brand Name (AR):    نيدها اوتو
Tagline (EN):       "Order your drive. Calm your day."
Tagline (AR):       "نظّم قيادتك. اهدأ يومك."
Domain:             nidhamauto.shop
Primary Color:      #0F1B2D (Midnight Navy)
Accent Color:       #C9962A (Saudi Gold)
Font:               Cairo (Google Fonts) — Arabic + Latin
Direction:          RTL (right-to-left)
Language:           Arabic (UI) — English only in code/metadata
```

**Logo:** Blue circle with the letter `N` in gold — shown on the right side of the header (RTL start).

---

## 3. PRODUCTS (LOCKED)

| ID | SKU | Arabic Name | Short | Price |
|----|-----|-------------|-------|-------|
| `seat-organizer` | `NM-SO-001` | المنظّم الذكي للمقعد | منظّم ذكي | 199 SAR |
| `seatgap-protector` | `NM-SG-001` | حامي فراغ المقعد | حامي المقعد | 199 SAR |
| `parking-mirror` | `NM-PM-001` | طقم مرايا الاصطفاف الدقيق | طقم المرايا | 199 SAR |

### Pricing Tiers (MANDATORY — same in frontend + backend)
```
1 unit  = 199 SAR
2 units = 279 SAR  (save 119)
3 units = 349 SAR  (save 248)
4 units = 349 + 199 = 548 SAR
5 units = 349 + 279 = 628 SAR
Upsell-only price: 99 SAR (shown ONLY in upsell modal — never elsewhere)
```

---

## 4. REQUIRED PAGES

Build all these pages with full content from `docs/05_COPYWRITING.md`:

1. **Home** (`/`) — Hero, pain strip, featured products, 3 alternating sections, trust, reviews, FAQ
2. **Collection** (`/shop`) — All 3 products grid with prices and tier display
3. **Product — Seat Organizer** (`/products/seat-organizer`)
4. **Product — SeatGap Protector** (`/products/seatgap-protector`)
5. **Product — Parking Mirror** (`/products/parking-mirror`)
6. **About Us** (`/about`) — Brand story, values, stats
7. **Contact** (`/contact`) — Contact form (Name, Email, Message)
8. **Thank You** (`/thank-you`) — Order confirmation
9. **Shipping Policy** (`/policies/shipping`)
10. **Returns Policy** (`/policies/returns`)
11. **COD Policy** (`/policies/cod`)
12. **Privacy Policy** (`/policies/privacy`)
13. **Terms of Service** (`/policies/terms`)

---

## 5. COMPLETE PURCHASE FLOW (IMPLEMENT EXACTLY)

```
1. User lands on page → pixels fire PageView
2. User views product → fire ViewContent pixel event
3. User clicks "اشتري الآن"
   → Product added to cart
   → Cart drawer opens from RIGHT (RTL)
   → Cross-sell shows (max 2 items)
   → Track AddToCart pixel event
4. User clicks "إتمام الطلب"
   → Checkout popup opens (fullscreen mobile, modal desktop)
   → Track InitiateCheckout pixel event
5. Checkout popup:
   → Shows order summary with tier-priced total
   → Social proof (reviews, trust)
   → Scarcity text
   → 2 fields: Name + Saudi Phone (05XXXXXXXX)
   → Validation: name min 2 chars, phone matches /^05\d{8}$/
   → CTA: "تأكيد طلبي" (disabled while invalid)
6. On valid form submit:
   → Generate event_id (for CAPI deduplication)
   → Show upsell modal (ONLY if not shown this session)
7. Upsell modal (10-15 second countdown):
   → Show 1 product NOT in cart at 99 SAR
   → Show original price struck through
   → Two buttons: Accept (99 SAR) / Decline
   → On timeout → auto-decline
8. After upsell decision:
   → POST to /api/orders with full payload + event_id
   → Backend: save to DB + send to Google Sheets webhook
   → Backend: fire Meta/TikTok/Snap CAPI in background
   → Frontend: fire Purchase pixel event with same event_id
   → Redirect to /thank-you
9. Thank you page:
   → Show order summary, order number
   → Show masked phone number
   → Show "what happens next" steps
   → 10-minute countdown for reservation
   → "خلّي جوالك قريب" reminder
```

---

## 6. COD CHECKOUT FORM RULES (STRICT)

```
Fields: Name + Phone ONLY (never add more)
Name validation:   required, min 2 chars, not all-numeric
Phone validation:  required, must match /^05\d{8}$/
Phone input:       dir="ltr", font monospace or tracking-wider
Phone placeholder: "05XXXXXXXX"
Phone helper:      "مثال: 0512345678"
Submit button:     disabled until both fields are valid
Error messages:    inline, Arabic, helpful (see docs/12_CRO_SAUDI_WOMEN.md)
```

---

## 7. TRACKING IMPLEMENTATION (CRITICAL)

### Web Pixels (No Hashing Required)
Load ALL three pixels with `requestIdleCallback` or `setTimeout(1500)` — NEVER block render.

```
Meta Pixel ID:     [YOUR_META_PIXEL_ID]
TikTok Pixel ID:   [YOUR_TIKTOK_PIXEL_ID]
Snapchat Pixel ID: [YOUR_SNAP_PIXEL_ID]
```

**Events to track on frontend:**
- `PageView` — every page
- `ViewContent` — product page load
- `AddToCart` — buy now click
- `InitiateCheckout` — checkout popup open
- `Purchase` — order confirmed (use same event_id as CAPI)

### CAPI — Server-Side (Backend — Hashing REQUIRED)

**Rules:**
- ALL PII must be SHA-256 hashed before sending
- Phone normalization: `05XXXXXXXX → 966XXXXXXXX` (Meta/Snap) | `+966XXXXXXXX` (TikTok)
- TikTok phone MUST have `+` prefix
- `event_id` must match web pixel event_id (deduplication)
- Fire all 3 CAPIs with `asyncio.gather()` in BackgroundTasks — never block order response

See `docs/09_TRACKING.md` for complete implementation with code.

---

## 8. GOOGLE SHEETS WEBHOOK

1. The backend sends a POST to `WEBHOOK_URL` after every order
2. The webhook is a Google Apps Script deployed as a Web App
3. See `docs/11_GOOGLE_SHEETS_WEBHOOK.md` for the full webhook JS code
4. The Google Sheet has 29 columns (see the CSV template in that doc)
5. Phone is stored with `'` prefix to force text format in Sheets

**Backend webhook service must:**
- Retry up to 2 times on failure (400ms delay between retries)
- Never fail the order response if webhook fails
- Log webhook failures

---

## 9. INFRASTRUCTURE

### Project Structure (REQUIRED)
```
nidhamauto/
├── frontend/    (Next.js)
├── backend/     (FastAPI)
├── docker-compose.yml
└── README.md
```

### Docker
- See `docs/10_INFRASTRUCTURE.md` for complete Dockerfiles and docker-compose.yml
- Both `frontend/Dockerfile` and `backend/Dockerfile` must be created
- `docker-compose.yml` includes frontend + backend + PostgreSQL

### Environment Files
- Create `frontend/.env.example` and `backend/.env.example`
- NEVER commit actual `.env` files
- See `docs/10_INFRASTRUCTURE.md` for all required env vars

---

## 10. DATABASE (PostgreSQL)

```
Connection: postgres://nidhamauto:nidhamauto@nidhamauto_database:5432/nidhamauto?sslmode=disable
```

Create two tables via Alembic migration:
- `orders` — see full schema in `docs/01_ARCHITECTURE.md`
- `order_items` — see full schema in `docs/01_ARCHITECTURE.md`

Run migrations: `alembic upgrade head`

---

## 11. DESIGN REQUIREMENTS

### RTL Rules (ALL required — no exceptions)
```html
<html lang="ar" dir="rtl">
```
- `text-align: right` for all Arabic text
- Cart drawer opens from the RIGHT side
- Logo on the RIGHT side of header (RTL start)
- Directional icons must flip: `rtl:scale-x-[-1]`
- Phone input: `dir="ltr"` override for number readability

### Alternating Sections (Home Page)
Three alternating image+text sections after featured products:
1. Section 1: Image RIGHT / Text LEFT (standard RTL)
2. Section 2: Image LEFT / Text RIGHT (reversed)
3. Section 3: Image RIGHT / Text LEFT (standard)

On mobile: image always stacks on top, text below.
See `docs/13_DESIGN_RESPONSIVE.md` for full CSS and component code.

### Responsive Requirements
- Mobile-first (< 768px is primary target)
- All touch targets: min 48px height
- All form inputs: min 52px height, 16px font (prevents iOS zoom)
- Product pages: sticky buy bar at bottom on mobile
- No horizontal scroll on any screen size

### Visual Hierarchy per Product Page
```
1. Gallery (main image + badge)
2. Star ratings (5 stars + review count)
3. Product name (H1)
4. Problem statement (sub-headline)
5. Scarcity badge (X pieces left)
6. Price box with tier pricing
7. 3 bullet benefits
8. BUY NOW button (gold, full-width)
9. COD trust bar (4 chips)
10. How it works (4 steps)
11. Materials block
12. FAQ accordion
13. Cross-sell section
```

---

## 12. ARABIC COPY RULES

1. Use copy EXACTLY as written in `docs/05_COPYWRITING.md` — do not rewrite
2. Address the user as `أنتِ` (feminine) throughout
3. Never use masculine pronouns
4. RTL punctuation — Arabic question marks and periods
5. Numbers in Arabic content: use Arabic numerals (٣ قطع) in benefits, Latin numerals (3) in prices
6. Currency: always `ر.س` not `SAR` in visible UI

---

## 13. CODING STANDARDS

See `docs/07_CODING_RULES.md` for complete rules. Key rules:

- TypeScript strictly typed — no `any`
- No hardcoded strings in JSX — import from `data/copy.ts`
- No inline styles — use Tailwind classes
- Zustand for cart and checkout state
- Dynamic imports for modals/popups (code splitting)
- Idempotency key generated on client, sent to backend
- Pricing logic must be IDENTICAL in frontend and backend

---

## 14. DELIVERABLES CHECKLIST

When done, verify each item:

**Frontend**
- [ ] All 13 pages built and working
- [ ] RTL layout correct on every page
- [ ] Alternating image+text sections on home page
- [ ] Cart drawer (opens right, cross-sell, tier pricing)
- [ ] Checkout popup (2 fields, validation, social proof, scarcity)
- [ ] Upsell modal (countdown, 99 SAR, auto-reject on timeout)
- [ ] Sticky mobile CTA bar on product pages
- [ ] All 3 web pixels loading deferred
- [ ] Purchase event fires with event_id on thank-you
- [ ] Responsive on 375px, 768px, 1280px
- [ ] `.env.example` created with all vars
- [ ] `Dockerfile` created

**Backend**
- [ ] `POST /api/orders` working
- [ ] DB schema created via Alembic migration
- [ ] Order saved to PostgreSQL
- [ ] Webhook sends to Google Sheets with retry
- [ ] Meta CAPI fires with hashed data
- [ ] TikTok CAPI fires (phone with + prefix, hashed)
- [ ] Snapchat CAPI fires with hashed data
- [ ] All CAPI uses same event_id as frontend pixel
- [ ] CAPI fires in background (never blocks response)
- [ ] `.env.example` created
- [ ] `Dockerfile` created

**Infrastructure**
- [ ] `docker-compose.yml` at root level
- [ ] Both services start with `docker-compose up`
- [ ] DB migrations run successfully
- [ ] Health endpoint `/health` responds

**Google Sheets**
- [ ] `webhook.js` (Apps Script code) file created in repo
- [ ] CSV column template documented
- [ ] Webhook tested with curl

---

## 15. START ORDER

Build in this exact order:

1. Create folder structure (`frontend/`, `backend/`, Docker files)
2. Create `.env.example` files for both
3. Backend: DB models + Alembic migration
4. Backend: `POST /api/orders` endpoint (with validation, DB save, webhook, CAPI)
5. Backend: Tracking services (hasher, CAPI for Meta/TikTok/Snap)
6. Backend: Webhook service (`webhook.js` Google Apps Script file)
7. Frontend: Tailwind config + design tokens + Cairo font
8. Frontend: Shared types, data files, copy strings
9. Frontend: UI components (Button, TrustChip, Stars, etc.)
10. Frontend: Header + Footer + CartDrawer
11. Frontend: Home page (all sections including alternating)
12. Frontend: Collection page
13. Frontend: Product page (all 3 products use same template)
14. Frontend: Checkout popup + Upsell modal
15. Frontend: Thank you page
16. Frontend: About, Contact, Policy pages
17. Frontend: Pixel tracking (Meta, TikTok, Snap) with deferred loading
18. Frontend: CAPI event_id generation and Purchase event
19. Test full purchase flow end-to-end
20. Verify Google Sheet receives the order

---

## 16. ENVIRONMENT VARIABLES NEEDED FROM CLIENT

Before starting, ask the client to provide these values:

```
# Pixels
META_PIXEL_ID          = [from Meta Events Manager]
META_CAPI_ACCESS_TOKEN = [from Meta Events Manager → Settings → Conversions API]
META_TEST_EVENT_CODE   = [from Meta Test Events tab — remove in production]

TIKTOK_PIXEL_ID        = [from TikTok Ads Manager → Tools → Events]
TIKTOK_CAPI_ACCESS_TOKEN = [from TikTok Ads Manager → Events → Web Events API]

SNAP_PIXEL_ID          = [from Snap Ads Manager → Business → Pixels]
SNAP_CAPI_ACCESS_TOKEN = [from Snap Ads Manager → Pixels → Setup → Conversions API]

# Webhook
WEBHOOK_URL            = [Google Apps Script Web App URL after deployment]

# Database (Easypanel)
DATABASE_URL           = postgres://nidhamauto:nidhamauto@nidhamauto_database:5432/nidhamauto?sslmode=disable

# Security
SECRET_KEY             = [generate with: python -c "import secrets; print(secrets.token_hex(32))"]
```

---

## 17. FINAL QUALITY CHECK

Before marking the project complete, verify:

1. Open the site on a real mobile device (or browser DevTools 375px)
2. The Arabic text reads correctly right-to-left
3. Add a product → cart drawer opens from the RIGHT
4. Go to checkout → popup shows correctly
5. Enter `نورة` and `0512345678` → form validates
6. Submit → upsell appears with countdown
7. Accept or reject → order posts to `/api/orders`
8. Check Google Sheet — order row appears
9. Check Meta/TikTok/Snap test events — Purchase event appears with correct event_id
10. Check that the web pixel event_id matches the CAPI event_id

---

## 18. NOTES FOR THE AI CODER

- This is a COD-only store — **never add online payment**
- This is a 3-product store — **never show more than 3 products**
- Cart drawer always opens from the **right side** (RTL)
- Upsell shown **once per session only** (use localStorage flag)
- TikTok phone hashing uses `+966XXXXXXXX` format — **do not forget the + prefix**
- All CAPI calls must use `BackgroundTasks` — **never block the order response**
- Tracking errors must be **silently swallowed** — a broken pixel never breaks an order
- Copy strings are in `docs/05_COPYWRITING.md` — **use Arabic copy exactly as written**
- The upsell price (99 SAR) **must never appear** outside the upsell modal

---

# END OF PROMPT
---

> ✅ This prompt is complete. Paste it to your AI coder along with access to the `/docs` folder.
> The coder has everything needed to build the full store from scratch.
