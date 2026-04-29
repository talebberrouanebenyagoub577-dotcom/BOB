# Website Structure & Flow (KSA COD)

Scope locked to website-only flow.

- No subscriptions
- No WhatsApp
- No SMS
- No quizzes
- No cart page (cart drawer only)
- Primary domain locked: `nidhamauto.shop`

---

## 1) Required Pages

1. Home Page
2. Collection Page
3. Product Page A (Phone Mount)
4. Product Page B (SeatGap Organizer)
5. Product Page C (Parking Mirror Kit)
6. Thank You Page
7. Contact Page
8. Policies Pages:
   - Shipping Policy
   - Return/Refund Policy
   - Privacy Policy
   - Terms of Service
   - COD Policy

---

## 2) Header (Clean + Professional)

### Desktop Header
- Left: Logo
- Center: Navigation (`Home`, `Shop`, `Contact`)
- Right: Cart icon with item count (opens drawer)
- Sticky on scroll

### Mobile Header
- Left: Hamburger
- Center: Logo
- Right: Cart icon + count (opens drawer)

### Header UX Rules
- Keep height compact (avoid wasting first-screen space)
- Always visible cart count
- No distracting promos in header

---

## 3) Footer (Conversion-Focused)

### Footer Blocks
1. Brand trust line: "Saudi-focused COD store for daily driving solutions."
2. Quick Links: Home, Shop, Contact
3. Policies links (all policy pages)
4. Contact email
5. Accepted payment note: "Cash on Delivery Available"

### Footer CRO Elements
- "Fast order confirmation" trust statement
- "Simple returns policy" short line with link
- Keep footer minimal and readable on mobile

---

## 4) Page Structure

## Home Page

### Sections
1. Hero:
   - Main promise
   - Primary CTA: `Shop Now`
2. Problem-Solution strip:
   - 3 pain points (phone drop, lost items, parking stress)
3. Featured products (3 cards)
   - CTA on each: `Buy Now`
4. Why trust us:
   - Practical tested products
   - COD convenience
   - Clear policies
5. Social proof block
6. FAQ teaser + policy links

## Collection Page
- Grid of 3 products
- Each card includes:
  - Product image
  - Price
  - 1-line benefit
  - CTA `Buy Now` (adds to cart directly)
  - Secondary `View Details`
- Sticky filter/sort optional (simple by default)

## Product Pages (3 pages)
- Structure:
  1. Gallery
  2. Product title + price
  3. 3 bullet benefits
  4. CTA `Buy Now` (add to cart)
  5. Trust chips (COD, shipping window, return window)
  6. How it works
  7. FAQ
  8. Bottom cross-sell section ("Complete Your Setup")

## Cart Page
## Cart Drawer (global)
- Opens from header cart icon or after `Buy Now`
- Cart item list + quantity controls
- Pricing block with package tiers
- Cross-sell module inside drawer
- CTA `Proceed to Checkout`

## Contact Page
- Simple contact form:
  - Name
  - Email
  - Message
- Contact email shown clearly
- Expected response time note

## Policy Pages
- Plain-language, mobile-first formatting
- Short paragraphs + bullet sections
- Explicit COD terms

---

## 5) User Flow (Exact)

1. User lands on Home / Collection / Product page.
2. User clicks `Buy Now`.
3. Product is added to cart and cart drawer opens.
4. Cart drawer shows relevant cross-sell products at original prices.
5. User clicks `Proceed to Checkout`.
6. Checkout popup opens on top of current page.
8. User enters:
   - Name
   - Phone number
9. Validation runs:
   - Name valid
   - Saudi phone format valid and starts with `0`
10. User clicks `Confirm My COD Order`.
11. Show one-time upsell offer (99 SAR) for 10-15 seconds.
12. User accepts or rejects upsell.
13. Final order (with/without upsell) is sent to webhook.
14. Redirect to Thank You page.

---

## 6) Cross-Sell Logic

## In Product Pages (Bottom Section)
- Show 2 cross-sell items only (not all 3, avoid overwhelm)
- Pre-checked add-on is not recommended (can reduce trust)
- Use clear mini-benefit under each cross-sell
- Show all cross-sells at original price only (no discount display here)

## In Cart Drawer
- Show "Frequently bought together" module
- Add with one click
- Recalculate total instantly
- Show original prices only (no discount display here)

## Product Mapping
- Phone Mount -> suggest SeatGap Organizer + Parking Mirror Kit
- SeatGap Organizer -> suggest Phone Mount + Parking Mirror Kit
- Parking Mirror Kit -> suggest Phone Mount + SeatGap Organizer

---

## 7) COD Checkout Popup Spec (High Conversion)

## Trigger
- Opens when user clicks `Proceed to Checkout` in cart drawer.

## Layout
- Left/Top: Order summary
  - Product names
  - Qty
  - Price according to package pricing rules
  - Total price
- Right/Bottom: Form (2 fields only)
  1. Name
  2. Phone (Saudi)

## Pricing Rules (Mandatory)
- 1 unit = 199 SAR
- 2 units = 279 SAR
- 3 units = 349 SAR
- For quantities above 3:
  - Repeat 3-unit block pricing, then apply remaining tier
  - Example: 4 units = 349 + 199 = 548 SAR
  - Example: 5 units = 349 + 279 = 628 SAR

## Form Validation Rules

### Name
- Required
- Min 2 characters
- Reject numeric-only input

### Phone
- Required
- Must start with `0`
- Must be Saudi mobile format
- Recommended regex:
  - `^05\d{8}$`
- Helper text below field:
  - "Example: 05XXXXXXXX"

## CTA Copy
- Primary: `Confirm My COD Order`
- Secondary microcopy:
  - "You will pay cash on delivery."

## Error UX
- Inline field-level errors
- Keep popup open, preserve typed data
- Highlight first invalid field

## Trust Micro-elements inside popup
- "Cash on Delivery"
- "No online payment required"
- "Order review before dispatch"

## Post-Validation Upsell Step (Only discounted moment)
- Triggered only after:
  - Name and phone are valid
  - User clicks `Confirm My COD Order`
- Show one product only at **99 SAR**
- Countdown visibility: 10-15 seconds
- Buttons:
  - `Add to My Order - 99 SAR`
  - `No, Continue`
- If timeout expires with no action:
  - Default to rejection and continue with original order

---

## 8) Webhook + Google Sheets Order Handling

## On Upsell Decision (final step before redirect)
- Frontend posts order payload to backend endpoint:
  - `POST /api/orders`
- Backend forwards sanitized payload to webhook URL connected to Google Sheets.

## Minimum Payload
- `order_id` (generated)
- `created_at`
- `customer_name`
- `phone`
- `items` (name, sku, qty, unit_price)
- `pricing_tier_applied` (1-unit, 2-unit, 3-unit, or mixed)
- `upsell_offered` (true/false)
- `upsell_product` (sku/name or null)
- `upsell_accepted` (true/false)
- `upsell_price` (99 or 0)
- `total`
- `source_page`
- `utm` (if available)

## Webhook Success Criteria
- 2xx response required
- On failure:
  - Show retry state
  - Do not redirect to thank-you until success

---

## 9) Thank You Page (CRO + Confirmation/Delivery Rate)

## Primary Goal
- Reinforce order confidence and reduce fake/impulse cancellations.

## Page Structure
1. Success headline:
   - "Your order is received."
2. Order summary recap
   - Include upsell item if accepted
3. What happens next (simple 3 steps)
4. Trust reminder:
   - COD payment on delivery
5. Upsell/Cross-sell section:
   - 1-2 additional products at original prices only
6. CTA:
   - `Add to Existing Order`

## Confirmation-Rate Optimizers
- Show expected processing timeline clearly
- Show entered phone number masked (for confidence)
- Emphasize "Keep your phone reachable"
- Keep copy short and direct

---

## 10) CRO Checklist (Critical)

1. Fast mobile load (<2.5s target)
2. Sticky CTA on product pages
3. Minimal form fields (already constrained to 2)
4. Inline validation with examples
5. Frictionless cart add-ons
6. Clear COD trust language everywhere
7. No conflicting CTA labels (use one main action wording)
8. Visual hierarchy: problem -> proof -> CTA

---

## 11) Suggested Copy Snippets

## Product CTA
- "Buy Now - Pay on Delivery"

## Cart CTA
- "Proceed to Checkout"

## Popup CTA
- "Confirm My COD Order"

## Phone Helper
- "Phone must start with 0. Example: 05XXXXXXXX"

## Thank You Upsell CTA
- "Add This to My Order"

## Upsell Offer Headline
- "Special one-time add-on for this order: 99 SAR"

---

## 12) Technical Notes for Next.js + React

- Use server-side route for order submission (never expose raw webhook URL in client).
- Implement idempotency key to prevent duplicate orders from repeated clicks.
- Disable CTA while submit is in progress.
- Implement upsell decision lock to avoid double submission on timeout + click race.
- Log webhook failures with retry queue (basic in-memory or DB-backed).
- Store policy content as static pages in `/app/policies/*`.
- Keep cart state in global client store (drawer accessible on all pages).

---

## 13) Domain Name Ideas (Brandable Alternatives)

Base-style ideas similar to `namahealth` but tuned for this niche:

- drivesakoon.com
- drivesakoon.co
- drivesakoon.store
- rahadrive.com
- rahadrive.co
- rahadrive.shop
- sayrplus.com
- sayrplus.co
- nidhamauto.com
- nidhamauto.co
- calmroadksa.com
- calmroadksa.co
- sakoondrive.com
- sakoondrive.co
- autowithraha.com

If `.com` is unavailable, prioritize:
- `.co`
- `.shop`
- `.store`
- `.sa` (if available and suitable for your setup)

### Locked Decision
- **Final primary domain:** `nidhamauto.shop`

