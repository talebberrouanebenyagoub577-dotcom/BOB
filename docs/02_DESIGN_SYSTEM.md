# 02 — Design System

> RTL-first. Arabic-native. Premium automotive aesthetic.
> Every design decision must serve trust, speed, and conversion on mobile.

---

## 1. Core Design Principles

1. **Mobile-first always** — 80%+ of Saudi traffic is mobile
2. **RTL by default** — Arabic reads right-to-left; never flip text or icons incorrectly
3. **Premium clarity** — clean, minimal, no visual noise; premium = space + confidence
4. **Trust through design** — every element either builds trust or drives action
5. **Speed over beauty** — performance (LCP < 2.5s) beats decorative complexity
6. **One action per screen** — never compete CTAs; always one primary action visible

---

## 2. Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Midnight Navy | `#0F1B2D` | Primary brand color, headers, hero backgrounds |
| Pearl White | `#F8F9FA` | Page backgrounds, clean sections |
| Pure White | `#FFFFFF` | Cards, popups, form fields |

### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| Saudi Gold | `#C9962A` | CTAs, highlights, price tags, premium badges |
| Warm Gold Light | `#F5D580` | Hover states, star ratings |
| Trust Green | `#16A34A` | Success states, COD badge, checkmarks |
| Alert Red | `#DC2626` | Form errors, urgency text |

### Neutral Grays
| Name | Hex | Usage |
|------|-----|-------|
| Gray 900 | `#111827` | Body text |
| Gray 600 | `#4B5563` | Secondary text, descriptions |
| Gray 300 | `#D1D5DB` | Borders, dividers |
| Gray 100 | `#F3F4F6` | Subtle backgrounds |

### TailwindCSS Config
```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        navy:  '#0F1B2D',
        gold:  '#C9962A',
        'gold-light': '#F5D580',
      },
      trust: {
        green: '#16A34A',
        red:   '#DC2626',
      }
    }
  }
}
```

---

## 3. Typography

### Primary Font: Cairo
- **Source:** Google Fonts
- **Weights used:** 400 (Regular), 600 (SemiBold), 700 (Bold), 800 (ExtraBold), 900 (Black)
- **Why Cairo:** Designed for Arabic, excellent Latin fallback, high legibility on mobile

```css
font-family: 'Cairo', sans-serif;
```

### Font Scale
| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-5xl` | 48px | 900 | Hero main headline |
| `text-4xl` | 36px | 800 | Section headlines |
| `text-3xl` | 30px | 700 | Product names, sub-headlines |
| `text-2xl` | 24px | 700 | Card titles, popup headings |
| `text-xl` | 20px | 600 | Prices, benefit lines |
| `text-lg` | 18px | 600 | Button text, CTA labels |
| `text-base` | 16px | 400 | Body text, descriptions |
| `text-sm` | 14px | 400 | Captions, helper text, tags |
| `text-xs` | 12px | 400 | Legal, fine print |

### Line Height
- Arabic body text: `leading-relaxed` (1.625) — Arabic needs more breathing room
- Headlines: `leading-tight` (1.25)

---

## 4. Spacing System

Use TailwindCSS default spacing (4px base unit). Key values:
- Section padding: `py-16` (64px) on desktop, `py-10` (40px) on mobile
- Card padding: `p-6` (24px)
- Button padding: `px-8 py-4` (32px × 16px)
- Gap between elements: `gap-4` to `gap-8`
- Container max-width: `max-w-6xl mx-auto px-4`

---

## 5. Component Library

### Button — Primary (CTA)
```tsx
// Gold CTA button — main action
<button className="
  w-full bg-brand-gold hover:bg-yellow-600
  text-white font-bold text-lg
  py-4 px-8 rounded-xl
  transition-all duration-200
  active:scale-95
  shadow-lg shadow-yellow-900/20
">
  اشتري الآن — الدفع عند الاستلام
</button>
```

### Button — Secondary
```tsx
<button className="
  w-full border-2 border-brand-navy text-brand-navy
  font-semibold text-base
  py-3 px-6 rounded-xl
  hover:bg-brand-navy hover:text-white
  transition-all duration-200
">
  عرض التفاصيل
</button>
```

### Button — Danger / Upsell
```tsx
<button className="
  w-full bg-trust-green hover:bg-green-700
  text-white font-bold text-lg
  py-4 px-8 rounded-xl
  transition-all duration-200
">
  أضف للطلب — 99 ر.س فقط
</button>
```

### Trust Chip
```tsx
// Small badge that communicates trust
<div className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
  <span className="text-trust-green text-base">✓</span>
  <span>الدفع عند الاستلام</span>
</div>
```

### Price Display
```tsx
<div className="flex items-baseline gap-2 flex-row-reverse justify-start">
  <span className="text-3xl font-black text-brand-gold">199</span>
  <span className="text-lg font-semibold text-gray-600">ر.س</span>
</div>
```

### Product Card
```tsx
<div className="bg-white rounded-2xl shadow-md overflow-hidden
                border border-gray-100 hover:shadow-xl
                transition-shadow duration-300">
  {/* image */}
  <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
    <img className="w-full h-full object-cover" />
  </div>
  {/* content */}
  <div className="p-5">
    <h3 className="text-xl font-bold text-brand-navy mb-2 text-right">...</h3>
    <p className="text-sm text-gray-600 text-right mb-4 leading-relaxed">...</p>
    <div className="flex justify-between items-center">
      <PriceDisplay />
      <BuyButton />
    </div>
  </div>
</div>
```

### COD Badge (always visible near CTA)
```tsx
<div className="flex items-center gap-1.5 bg-green-50 border border-green-200
                rounded-lg px-3 py-2 w-fit">
  <span className="text-trust-green font-bold text-sm">✓</span>
  <span className="text-trust-green font-semibold text-sm">الدفع عند الاستلام</span>
</div>
```

### Star Rating
```tsx
<div className="flex gap-0.5 flex-row-reverse">
  {[1,2,3,4,5].map(i => (
    <span key={i} className="text-brand-gold text-lg">★</span>
  ))}
</div>
```

### Section Heading Pattern
```tsx
<div className="text-center mb-10">
  <span className="text-brand-gold font-bold text-sm uppercase tracking-widest mb-2 block">
    العنوان الصغير
  </span>
  <h2 className="text-4xl font-black text-brand-navy leading-tight">
    العنوان الرئيسي
  </h2>
  <p className="text-gray-600 mt-3 text-lg max-w-2xl mx-auto">
    النص التوضيحي
  </p>
</div>
```

---

## 6. Header Design

```
Desktop:
[ نظام أوتو — Logo ]   [ الرئيسية | المتجر | تواصل ]   [ 🛒 (1) ]
                         ← RTL: nav items right-to-left

Mobile:
[ ☰ ]   [ نظام أوتو — Logo ]   [ 🛒 (1) ]
```

- Height: `h-16` (64px)
- Background: `bg-white` with `border-b border-gray-200`
- Sticky: `sticky top-0 z-50`
- Shadow on scroll: add `shadow-sm` via JS scroll listener

---

## 7. Cart Drawer Design

- **Position:** Slides in from RIGHT (RTL direction)
- **Width:** `w-full max-w-sm` (380px)
- **Background:** `bg-white`
- **Overlay:** `bg-black/50` behind drawer
- **Animation:** `translate-x-0` → `translate-x-full` (slide from right)

### Layout inside drawer:
```
[Header: سلة التسوق  ×]
────────────────────────
[Item 1: image | name | qty controls | price]
[Item 2: image | name | qty controls | price]
────────────────────────
[Cross-sell: "أكمل منظومتك" — 1-2 items]
────────────────────────
[Total: المجموع — XXX ر.س]
[CTA: إتمام الطلب →]
```

---

## 8. COD Checkout Popup Design

- **Trigger:** On "إتمام الطلب" click
- **Style:** Full-screen modal overlay on mobile, centered modal on desktop
- **Background:** `bg-white` rounded-2xl
- **Max width:** `max-w-lg w-full`

### Layout (RTL):
```
[Order Summary — right side on desktop / top on mobile]
  Product name | Qty | Price
  ─────────────────────────
  Total: XXX ر.س

[Form — left on desktop / below on mobile]
  [Name field — text-right placeholder]
  [Phone field — text-right placeholder: 05XXXXXXXX]
  
  [Trust line: الدفع عند الاستلام — بدون بطاقة]
  
  [CTA: تأكيد طلبي — كبير وذهبي]
```

---

## 9. Upsell Modal Design

- **Appears:** After checkout form submission
- **Duration:** 12-second countdown visible
- **Style:** Compact, focused, single product

```
┌─────────────────────────────┐
│  ⚡ عرض حصري لطلبك فقط      │
│                             │
│  [Product Image]            │
│  اسم المنتج                 │
│  فائدة واحدة مقنعة          │
│                             │
│  ~~199 ر.س~~ → 99 ر.س فقط  │
│                             │
│  [أضف للطلب — 99 ر.س]      │
│  [لا شكراً، أكمل بدونه]    │
│                             │
│  ⏱ ينتهي العرض خلال: 0:09  │
└─────────────────────────────┘
```

---

## 10. Mobile-First Breakpoints

| Breakpoint | Width | Notes |
|-----------|-------|-------|
| default | < 640px | Mobile — primary target |
| `sm:` | 640px+ | Large phones |
| `md:` | 768px+ | Tablets |
| `lg:` | 1024px+ | Desktop |
| `xl:` | 1280px+ | Wide desktop |

Always design mobile-first: write base styles for mobile, use `md:` and `lg:` for enhancements only.

---

## 11. Iconography

- Use **Lucide React** or **Heroicons** for UI icons (small, functional)
- Use Arabic-friendly unicode symbols for decorative elements: ✓ ★ ⚡ 🛡 📦 🚗
- Never use icons that could be misread in RTL (directional arrows must flip)

RTL icon flip rule:
```css
.icon-directional {
  transform: scaleX(-1); /* Flip horizontal for RTL */
}
```

Or with Tailwind: `className="rtl:scale-x-[-1]"`

---

## 12. Imagery Direction

### Product images
- **Style:** Clean white or neutral background — premium product photography
- **Aspect ratio:** 4:3 for cards, 1:1 for thumbnails, 16:9 for hero
- **Min resolution:** 800×600px for cards, 1200×800px for hero

### Trust imagery
- Saudi-looking commute environments (urban KSA: Riyadh highways, family cars)
- Women driving imagery — normalized, confident, relatable
- Never use stock photos that look generic Western

### Hero section
- Strong dark overlay on image (0.65 opacity)
- Text must be legible on mobile in direct sunlight simulation

---

## 13. Animation & Interaction Guidelines

- **CTA hover:** `transition-all duration-200` — subtle scale or glow
- **Active state:** `active:scale-95` — tactile feedback on tap
- **Modal open:** `opacity-0 → opacity-100 + translate-y-4 → translate-y-0` (200ms)
- **Cart drawer:** `translate-x-full → translate-x-0` (250ms ease-out)
- **Loading state:** pulse skeleton or spinner; never freeze UI

**NO heavy animations** (parallax, scroll-triggered animations, etc.) — performance over decoration.

---

## 14. RTL Checklist for Every Component

- [ ] `dir="rtl"` on `<html>` (set in root layout)
- [ ] Text alignment: `text-right` by default for Arabic content
- [ ] Flex direction: `flex-row-reverse` where needed for RTL visual order
- [ ] Padding/margin: use logical properties or be explicit (`pr-` vs `pl-`)
- [ ] Icons that indicate direction (arrows, chevrons) must point RTL
- [ ] Cart drawer opens from the right
- [ ] Form fields: `text-right` and `dir="rtl"` on inputs
- [ ] Phone number input: allow `dir="ltr"` override for number input
- [ ] Don't use `float: left/right` — use Flexbox/Grid
