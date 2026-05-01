# 06 — CRO (Conversion Rate Optimization)

> Every page element must either build trust, reduce friction, or push one clear action.
> No decoration without function. No function without a clear conversion purpose.

---

## 1. CRO Hierarchy (Priority Order)

1. **Speed** — LCP < 2.5s; slow = no conversion
2. **Clarity** — Visitor knows what this is and what to do within 3 seconds of landing
3. **Trust** — Every doubt must be answered before it's asked
4. **Friction removal** — Fewest clicks, fewest fields, fewest decisions
5. **Urgency** — Ethical, real scarcity only

---

## 2. Home Page CRO Spec

### Above the Fold (0–600px on mobile)
Must contain:
- [ ] Brand name + short tagline
- [ ] Problem-first headline (immediately resonates)
- [ ] Single CTA: "اكتشف المنظومة" (scroll or link to shop)
- [ ] 3 trust chips: COD / Fast delivery / Free returns
- [ ] Hero image or product visual

**Zero tolerance:** No hero section that doesn't clearly communicate the value prop and have one CTA.

### Section Order (scroll)
```
1. Hero
2. Pain Point Strip (3 icons — 3 problems — 3 words each)
3. Featured Products (3 cards with Buy Now)
4. Trust/Why Us (4 benefit blocks)
5. Social Proof (3 reviews minimum)
6. FAQ Teaser (3 questions)
7. Footer
```

### Product Cards on Home
- Image (4:3)
- Product name (bold, short)
- One-line benefit (specific problem named)
- Price (199 ر.س)
- Two CTAs: "اشتري الآن" (primary) + "عرض التفاصيل" (secondary)

---

## 3. Product Page CRO Spec

### Above the Fold
```
[ Product Gallery (swipeable on mobile) ]
[ Product Name (H1) ]
[ One-line problem statement ]
[ Price: 199 ر.س ]
[ BUY NOW — large gold button ]
[ Trust Chips: ✓ COD  ✓ Delivery ETA  ✓ Returns ]
```

### Full Page Section Order
```
1. Gallery + Name + Price + CTA + Trust Chips
2. Problem headline + 3 benefit bullets
3. "كيف يعمل" (How it works — 4 steps with icons)
4. Materials & Specs (transparency block)
5. Social Proof (2-3 reviews)
6. FAQ (3-5 questions)
7. Cross-sell section ("أكملي منظومتك")
8. Sticky Buy CTA bar at bottom on mobile
```

### Sticky Mobile CTA Bar
Always visible at bottom of screen on product page:
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200
                p-4 flex items-center justify-between z-40 md:hidden">
  <div>
    <span className="text-2xl font-black text-brand-gold">199 ر.س</span>
    <span className="text-sm text-gray-500 block">الدفع عند الاستلام</span>
  </div>
  <button className="bg-brand-gold text-white font-bold py-3 px-8 rounded-xl">
    اشتري الآن
  </button>
</div>
```

---

## 4. COD Checkout Popup CRO Spec

### Trigger
- Opens when user clicks "إتمام الطلب" in cart drawer
- Must NOT open automatically (respects user intent)

### Layout Rules
- **Mobile:** Full screen takeover (better focus)
- **Desktop:** Centered modal, max-w-lg, dark overlay
- Left side (desktop) / Top section (mobile): Order Summary
- Right side (desktop) / Bottom section (mobile): 2-field form

### Order Summary Display
Show per item:
- Product name (Arabic)
- Quantity selector (+ / −)
- Line price (calculated by pricing tier)
- Separator
- Total line (bold, large)

**Pricing tier recalculates live** as quantity changes.

### Form: 2 Fields Only (Never add more)
1. **Name field** — `type="text"` — placeholder "مثال: نورة العمري"
2. **Phone field** — `type="tel"` — placeholder "05XXXXXXXX" — `dir="ltr"`

### Validation (Real-time, on blur)
```
Name: required, min 2 chars, not all-numeric
Phone: required, matches /^05\d{8}$/
```

### Trust Elements Inside Popup
```
✓ الدفع عند الاستلام — بدون بطاقة
✓ راجع طلبك قبل ما تدفع
```

### Submit Button States
```
Idle:     [ تأكيد طلبي ]
Loading:  [ جاري المعالجة... ] + spinner  (disabled)
Error:    [ حدث خطأ — حاول مجدداً ]
```

---

## 5. Upsell Modal CRO Spec

### Trigger Conditions (ALL must be true)
- [ ] Name is valid
- [ ] Phone is valid
- [ ] User clicked "تأكيد طلبي"
- [ ] Upsell has NOT been shown yet this session

### Timer Logic
- **Duration:** 12 seconds
- **Visual:** Countdown display "0:12 → 0:11 → ... → 0:00"
- **On timeout:** Auto-dismiss = rejection (submit original order, redirect to thank-you)
- **On accept:** Add upsell item (99 SAR) to order payload
- **On decline:** Submit original order without upsell

### One Upsell Only (Never show 2)
Based on cart contents, show the single most relevant upsell:
```
Cart has phone-mount → upsell: seatgap-organizer (99 SAR)
Cart has seatgap-organizer → upsell: phone-mount (99 SAR)
Cart has parking-mirror-kit → upsell: phone-mount (99 SAR)
Cart has all three → no upsell shown
```

### Race Condition Prevention
- Lock the "accept" button after first click (prevent double submit)
- Cancel timer on first user action (accept or decline)
- Set `upsell_shown = true` in state — never show twice

---

## 6. Cart Drawer CRO Spec

### Open Trigger
- "اشتري الآن" (Buy Now) on product card / product page
- Cart icon in header

### Drawer Contents Order
```
1. Header: "سلة التسوق" + close X
2. Item list (image | name | qty controls | price)
3. Divider
4. Cross-sell module: "أضيفي هذا أيضاً" (1-2 items max)
5. Divider
6. Total row (calculated live)
7. CTA: "إتمام الطلب →"
```

### Cross-sell in Drawer
- Max 2 items shown (not all 3 products)
- "أضف" button — one click adds to cart and updates total
- Show at original price (199 SAR) — no discount here

---

## 7. Thank You Page CRO Spec

### Primary Goal: Reduce cancellations
The COD model has a risk of "ghost orders" (person orders but isn't home for delivery). The thank you page must increase commitment.

### Elements (in order)
```
1. ✓ Success icon + "تم استلام طلبك" headline
2. Order summary (what they ordered, total, COD reminder)
3. Masked phone number: "سنتصل على الرقم: 05xxxxx78"
4. "What happens next" — 3 simple steps
5. "💡 خلّي جوالك قريب" — keep phone ready reminder
6. Cross-sell section (original prices — "أضيفي لطلبك الحالي")
```

### Confirmation Rate Optimizers
- Show delivery estimate by city if detectable
- Remind: "ستتلقين مكالمة تأكيد قريباً" (confirmation call coming)
- Keep copy short — under 150 words total
- No distracting links to other pages (except the cross-sell)

---

## 8. Trust Elements — Global Checklist

Apply to every page in the correct locations:

| Element | Location | Frequency |
|---------|----------|-----------|
| COD badge "الدفع عند الاستلام" | Near every CTA, header, popup | Always |
| Delivery ETA | Product page, cart drawer, popup | Always |
| Returns policy link | Product page, footer | Always |
| Materials disclosure | Product page | Per product |
| Review block | Home + product pages | Min 3 reviews |
| WhatsApp contact link | Footer, contact page | Footer only |
| Security "No card required" | Popup, checkout | Checkout only |

---

## 9. Urgency & Scarcity (Ethical Only)

### Allowed
- "الكمية محدودة هذا الأسبوع" — if actually limited
- "اليوم آخر يوم للشحن في نفس اليوم" — only if factually true
- Countdown on upsell modal — real 12-second window
- "X طلب آخر تم هذا الأسبوع" — only if data is real

### Never Allowed
- Fake stock counters that reset
- Fake "X أشخاص يشاهدون الآن" unless technically real
- Fake countdown timers that never actually expire
- Price "was X, now Y" without a real price change

---

## 10. Page Load Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|--------------------|
| LCP (Largest Contentful Paint) | < 2.5s | Fail at > 4s |
| FID (First Input Delay) | < 100ms | Fail at > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | Fail at > 0.25 |
| TTI (Time to Interactive) | < 3.8s | — |
| Mobile Lighthouse Score | > 85 | — |

### Performance Rules
- Use `next/image` with WebP format and proper sizes
- Lazy load below-fold images
- Font: Load Cairo with `display=swap`
- No heavy animation libraries
- Minimize JavaScript bundle size

---

## 11. Mobile UX Critical Rules

- Buttons: min height 48px (touch target)
- Form fields: min height 52px
- Font: min 16px on inputs (prevents iOS auto-zoom)
- Tap targets: min 44x44px spacing between interactive elements
- Popup: Full screen on mobile (not partial modal)
- Cart drawer: 100% height, scroll within content area
- Never auto-focus fields (prevents keyboard from covering CTA)

---

## 12. A/B Test Opportunities (Post-Launch)

| Test | Variant A | Variant B |
|------|-----------|-----------|
| Hero headline | Problem-first | Solution-first |
| CTA copy | "اشتري الآن" | "احصلي عليه الآن" |
| Price display | "199 ر.س" | "199 ريال سعودي" |
| Upsell timer | 12 seconds | 20 seconds |
| Product page CTA | Sticky bar always visible | Appears after scroll |
| Checkout popup | Full screen mobile | Partial modal mobile |

Track: Click-through rate, checkout start rate, order completion rate, upsell acceptance rate.
