# 13 — Responsive Design & Alternating Section Layout

> Fully responsive — mobile-first.
> Alternating sections: Image + Text (right) → Text + Image (left) → repeat.
> RTL-aware: "right" in RTL means the start side.

---

## 1. Responsive Breakpoint System

```css
/* Base = Mobile (< 640px) — design here first */
/* sm:  = 640px+  (large phones) */
/* md:  = 768px+  (tablets)      */
/* lg:  = 1024px+ (desktop)      */
/* xl:  = 1280px+ (wide desktop) */
```

**Mobile is the primary target.** Saudi traffic is 85%+ mobile.
Write base styles for 375–430px screens first.

---

## 2. Alternating Section Pattern

### Layout Concept

```
Section 1 (Standard):
RTL:   [IMAGE]  [TEXT]     ← Image on right (start), text on left (end)
LTR:   [TEXT]  [IMAGE]

Section 2 (Reversed):
RTL:   [TEXT]  [IMAGE]     ← Text on right (start), image on left (end)
LTR:   [IMAGE] [TEXT]

Section 3 (Standard again): repeats...
```

### Component: `AlternatingSection.tsx`

```tsx
// components/home/AlternatingSection.tsx
interface AlternatingSectionProps {
  image: string
  imageAlt: string
  badge?: string
  title: string
  body: string
  bullets?: string[]
  cta?: { label: string; href: string }
  reverse?: boolean   // true = image on left (end) in RTL
  background?: 'white' | 'gray'
}

export function AlternatingSection({
  image, imageAlt, badge, title, body, bullets, cta,
  reverse = false,
  background = 'white',
}: AlternatingSectionProps) {
  return (
    <section
      className={`alt-section ${background === 'gray' ? 'alt-section--gray' : ''}`}
    >
      <div className={`alt-section-inner ${reverse ? 'alt-section--reverse' : ''}`}>
        {/* Image */}
        <div className="alt-img-wrap">
          <img src={image} alt={imageAlt} loading="lazy" />
        </div>

        {/* Text */}
        <div className="alt-text-wrap">
          {badge && <span className="section-tag">{badge}</span>}
          <h2 className="alt-title">{title}</h2>
          <p className="alt-body">{body}</p>
          {bullets && (
            <ul className="alt-bullets">
              {bullets.map((b, i) => (
                <li key={i}><span className="alt-check">✓</span> {b}</li>
              ))}
            </ul>
          )}
          {cta && (
            <a href={cta.href} className="btn btn-gold" style={{ marginTop: 24 }}>
              {cta.label} ←
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
```

### CSS for Alternating Sections

```css
/* styles/alternating.css */

.alt-section {
  padding: 64px 0;
  background: var(--white);
}

.alt-section--gray {
  background: var(--gray-50);
}

.alt-section-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

/* Standard: image first (right in RTL) */
.alt-section-inner .alt-img-wrap {
  order: 1;
}
.alt-section-inner .alt-text-wrap {
  order: 2;
}

/* Reversed: text first (right in RTL), image second */
.alt-section--reverse .alt-img-wrap {
  order: 2;
}
.alt-section--reverse .alt-text-wrap {
  order: 1;
}

.alt-img-wrap {
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 4/3;
  background: var(--gray-100);
  box-shadow: 0 8px 32px rgba(0,0,0,.10);
}

.alt-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .4s ease;
}

.alt-img-wrap:hover img {
  transform: scale(1.03);
}

.alt-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alt-title {
  font-size: clamp(24px, 3.5vw, 36px);
  font-weight: 900;
  color: var(--navy);
  line-height: 1.25;
}

.alt-body {
  font-size: 16px;
  color: var(--gray-600);
  line-height: 1.8;
}

.alt-bullets {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alt-bullets li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 15px;
  color: var(--gray-900);
  line-height: 1.5;
}

.alt-check {
  color: var(--green);
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
}

/* Mobile: stack vertically (image always on top) */
@media (max-width: 768px) {
  .alt-section-inner {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .alt-section-inner .alt-img-wrap,
  .alt-section--reverse .alt-img-wrap {
    order: 1;   /* image always first on mobile */
  }

  .alt-section-inner .alt-text-wrap,
  .alt-section--reverse .alt-text-wrap {
    order: 2;
  }
}
```

---

## 3. Home Page Alternating Sections Plan

Use these 3 alternating sections on the Home page between "Featured Products" and "Trust Section":

### Section 1 — Standard (image right, text left)
```tsx
<AlternatingSection
  image="/images/home/seat-organizer-lifestyle.jpg"
  imageAlt="منظّم المقعد الذكي"
  badge="المشكلة الأولى"
  title="سيارتك مرآة شخصيتك — خلّيها تبيّن ذوقك"
  body="الفوضى في السيارة ليست ضعفاً في الشخصية — هي نقص في الأدوات الصح.
        المنظّم الذكي يحوّل فوضى مقعدك إلى مساحة منظمة خلال دقيقتين."
  bullets={[
    "٦ جيوب مخصصة لكل أغراضك",
    "مادة مقاومة للماء والحرارة",
    "ركابك يشعرون بالفرق فوراً",
  ]}
  cta={{ label: "اكتشف المنظّم", href: "/products/seat-organizer" }}
  reverse={false}
  background="gray"
/>
```

### Section 2 — Reversed (text right, image left)
```tsx
<AlternatingSection
  image="/images/home/seat-gap-lifestyle.jpg"
  imageAlt="حامي فراغ المقعد"
  badge="المشكلة الثانية"
  title="أنهي حرب المفاتيح الصباحية إلى الأبد"
  body="الفجوة بين مقعدك والكونسول تبتلع 3 دقائق من وقتك كل يوم.
        بعد سنة — هذا يوم كامل ضاع في البحث عن نفس الأغراض."
  bullets={[
    "يسد الفجوة تماماً من أول تركيب",
    "جيب جانبي إضافي للهاتف والبطاقات",
    "سيليكون طبي يتحمل 70°C",
  ]}
  cta={{ label: "احمِ فراغ مقعدك", href: "/products/seatgap-protector" }}
  reverse={true}
  background="white"
/>
```

### Section 3 — Standard (image right, text left)
```tsx
<AlternatingSection
  image="/images/home/parking-mirror-lifestyle.jpg"
  imageAlt="طقم مرايا الاصطفاف"
  badge="المشكلة الثالثة"
  title="الاصطفاف بثقة ليس موهبة — هو أداة"
  body="قلق الخدش في الاصطفاف ليس خوفاً — هو نقص في الرؤية.
        طقم مرايا Precision View يضيف 160 درجة لمجال رؤيتك."
  bullets={[
    "ترين الزاوية العمياء بوضوح تام",
    "تركيب في دقيقة — لاصق 3M يتحمل الحرارة",
    "لا تغيير في شكل السيارة",
  ]}
  cta={{ label: "اصطفّ بثقة", href: "/products/parking-mirror" }}
  reverse={false}
  background="gray"
/>
```

---

## 4. Full Responsive Checklist

### Typography
- [ ] Minimum body font: 16px on mobile (prevents iOS auto-zoom on inputs)
- [ ] Headings: `clamp(24px, 5vw, 52px)` — fluid scaling
- [ ] Line height Arabic: 1.7–1.8 (Arabic needs more space than Latin)
- [ ] Font: Cairo loaded via Google Fonts, `display=swap`

### Layout
- [ ] All grids collapse to single column on mobile
- [ ] Container max-width: 1100px, padding: 20px on sides
- [ ] No horizontal overflow (no `overflow-x: hidden` needed)
- [ ] Images: `max-width: 100%`, aspect-ratio locked

### Touch / Interactive
- [ ] All buttons: min height 48px (Apple/Google guidelines)
- [ ] All form inputs: min height 52px, font-size 16px (no iOS zoom)
- [ ] Tap targets: minimum 44×44px with 8px spacing between
- [ ] Cart drawer: full-width on mobile, max-w-sm on desktop
- [ ] Checkout popup: full-screen on mobile, max-w-lg centered on desktop
- [ ] Sticky CTA bar: visible only on mobile product pages

### Images
- [ ] All images served as WebP (Next.js `next/image` handles this)
- [ ] `priority={true}` only for above-fold images (1 per page max)
- [ ] `loading="lazy"` on all below-fold images
- [ ] Correct `sizes` attribute for responsive images

### Performance (Mobile)
- [ ] LCP < 2.5s on 4G mobile
- [ ] No render-blocking scripts
- [ ] Pixels deferred via `requestIdleCallback`
- [ ] CSS critical path inlined (Next.js handles this)

---

## 5. Mobile-Specific Components

### Sticky Mobile CTA Bar (Product Pages)

Always visible on product page scroll — fixed at bottom:

```tsx
// Visible only on mobile via CSS: display: none on md+
<div className="sticky-buy-bar">
  <div className="sticky-buy-price">
    <span>199 ر.س</span>
    <span className="sticky-sub">الدفع عند الاستلام</span>
  </div>
  <button className="btn btn-gold" onClick={handleBuy}>
    اشتري الآن ←
  </button>
</div>
```

```css
.sticky-buy-bar {
  display: none;  /* hidden on desktop */
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: white;
  border-top: 1px solid var(--gray-200);
  padding: 12px 16px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  z-index: 80;
  box-shadow: 0 -4px 12px rgba(0,0,0,.08);
}

@media (max-width: 768px) {
  .sticky-buy-bar { display: flex; }
  .product-page { padding-bottom: 80px; } /* space for sticky bar */
}
```

### Mobile Navigation Drawer (Hamburger Menu)

```tsx
// Hamburger visible on mobile, nav hidden
// Opens a full-height side drawer from the right (RTL)
```

```css
.nav { display: flex; }
.hamburger { display: none; }

@media (max-width: 768px) {
  .nav { display: none; }
  .hamburger { display: flex; }
}

.mobile-nav {
  position: fixed;
  top: 0; right: -100%;
  width: 280px; height: 100vh;
  background: white;
  z-index: 150;
  transition: right .25s ease;
  padding: 24px 20px;
  display: flex; flex-direction: column; gap: 8px;
}

.mobile-nav.open { right: 0; }
```

---

## 6. Image Guidelines for Each Section

| Section | Recommended Image Style | Aspect Ratio |
|---------|------------------------|--------------|
| Hero | Dark lifestyle, car interior, Saudi road | 16:9 |
| Alternating (product) | Close-up product in use in car | 4:3 |
| Product page gallery | White/neutral background, multiple angles | 1:1 |
| Review card avatar | Solid color circle with initial | — |
| About page | Team/brand story lifestyle | 3:2 |

### Image Naming Convention
```
public/images/
├── hero-banner.webp
├── products/
│   ├── seat-organizer-main.webp
│   ├── seat-organizer-lifestyle.webp
│   ├── seatgap-protector-main.webp
│   ├── seatgap-protector-lifestyle.webp
│   ├── parking-mirror-main.webp
│   └── parking-mirror-lifestyle.webp
└── home/
    ├── section-1-alt.webp
    ├── section-2-alt.webp
    └── section-3-alt.webp
```
