# 10 — Infrastructure & DevOps

> Monorepo with separate frontend/ and backend/ folders.
> Docker Compose for local dev. Easypanel for production.
> Domain: nidhamauto.shop (frontend + backend on same domain, different paths).

---

## 1. Root Project Structure

```
nidhamauto/
├── frontend/                  # Next.js 14 App Router + TailwindCSS
├── backend/                   # FastAPI Python 3.11
├── docker-compose.yml         # Local development
├── docker-compose.prod.yml    # Production reference
├── .env.example               # Root-level (shared secrets reference)
└── README.md
```

---

## 2. Frontend Folder Structure

```
frontend/
├── app/
│   ├── layout.tsx             # Root layout — RTL, Cairo font, pixel init
│   ├── page.tsx               # Home page
│   ├── shop/page.tsx          # Collection page
│   ├── products/[slug]/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── thank-you/page.tsx
│   └── policies/[slug]/page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── CartDrawer.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── PriceTiers.tsx
│   │   ├── BenefitsList.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── MaterialsBlock.tsx
│   │   ├── ProductFAQ.tsx
│   │   └── CrossSellSection.tsx
│   ├── checkout/
│   │   ├── CheckoutPopup.tsx
│   │   ├── UpsellModal.tsx
│   │   └── OrderSummary.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── PainStrip.tsx
│   │   ├── FeaturedProducts.tsx
│   │   ├── AlternatingSection.tsx  ← image+text / text+image
│   │   ├── TrustSection.tsx
│   │   ├── ReviewsSection.tsx
│   │   └── FAQSection.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── StarRating.tsx
│       ├── TrustChip.tsx
│       ├── ScarcityBadge.tsx
│       ├── CountdownTimer.tsx
│       └── Modal.tsx
├── lib/
│   ├── tracking.ts            # Unified pixel + event tracking
│   ├── pixels/
│   │   ├── meta.ts
│   │   ├── tiktok.ts
│   │   └── snapchat.ts
│   ├── pricing.ts
│   ├── orderApi.ts
│   ├── validation.ts
│   └── idempotency.ts
├── store/
│   ├── cartStore.ts
│   └── checkoutStore.ts
├── data/
│   ├── products.ts
│   ├── copy.ts
│   └── policies.ts
├── types/
│   ├── product.ts
│   ├── order.ts
│   └── cart.ts
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   └── products/
│   └── fonts/
├── .env.local                 # Never commit
├── .env.example               # Commit this
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── Dockerfile
└── package.json
```

---

## 3. Backend Folder Structure

```
backend/
├── app/
│   ├── main.py                # FastAPI app entry + middleware
│   ├── config.py              # Pydantic Settings from env
│   ├── database.py            # SQLAlchemy async engine + session
│   ├── models/
│   │   ├── order.py
│   │   └── order_item.py
│   ├── schemas/
│   │   ├── order.py           # Request/Response schemas
│   │   └── tracking.py        # Pixel event schemas
│   ├── routers/
│   │   ├── orders.py          # POST /api/orders
│   │   └── health.py          # GET /health
│   └── services/
│       ├── order_service.py
│       ├── webhook_service.py
│       └── tracking/
│           ├── hasher.py
│           ├── user_data.py
│           ├── meta_capi.py
│           ├── tiktok_capi.py
│           ├── snap_capi.py
│           └── orchestrator.py
├── alembic/
│   ├── versions/
│   └── env.py
├── requirements.txt
├── alembic.ini
├── .env                       # Never commit
├── .env.example               # Commit this
└── Dockerfile
```

---

## 4. Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 5. Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

---

## 6. Docker Compose (Local Dev)

```yaml
# docker-compose.yml
version: "3.9"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
      - NEXT_PUBLIC_SITE_URL=http://localhost:3000
    env_file:
      - ./frontend/.env.local
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgres://nidhamauto:nidhamauto@db:5432/nidhamauto
    env_file:
      - ./backend/.env
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: nidhamauto
      POSTGRES_PASSWORD: nidhamauto
      POSTGRES_DB: nidhamauto
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nidhamauto"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

---

## 7. Docker Compose (Production Reference)

```yaml
# docker-compose.prod.yml
version: "3.9"

services:
  frontend:
    image: nidhamauto/frontend:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://nidhamauto.shop
      - NEXT_PUBLIC_SITE_URL=https://nidhamauto.shop

  backend:
    image: nidhamauto/backend:latest
    restart: unless-stopped
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - WEBHOOK_URL=${WEBHOOK_URL}
      - CORS_ORIGINS=https://nidhamauto.shop
```

---

## 8. Frontend .env.example

```env
# === SITE ===
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# === META PIXEL ===
NEXT_PUBLIC_META_PIXEL_ID=

# === TIKTOK PIXEL ===
NEXT_PUBLIC_TIKTOK_PIXEL_ID=

# === SNAPCHAT PIXEL ===
NEXT_PUBLIC_SNAP_PIXEL_ID=
```

---

## 9. Backend .env.example

```env
# === DATABASE ===
DATABASE_URL=postgres://nidhamauto:nidhamauto@nidhamauto_database:5432/nidhamauto?sslmode=disable

# === CORS ===
CORS_ORIGINS=https://nidhamauto.shop,http://localhost:3000

# === WEBHOOK ===
WEBHOOK_URL=
WEBHOOK_TIMEOUT_MS=10000
WEBHOOK_MAX_RETRIES=2

# === SECRET ===
SECRET_KEY=change_me_to_random_64_char_string

# === META CAPI ===
META_PIXEL_ID=
META_CAPI_ACCESS_TOKEN=
META_TEST_EVENT_CODE=

# === TIKTOK CAPI ===
TIKTOK_PIXEL_ID=
TIKTOK_CAPI_ACCESS_TOKEN=

# === SNAPCHAT CAPI ===
SNAP_PIXEL_ID=
SNAP_CAPI_ACCESS_TOKEN=
```

---

## 10. Backend requirements.txt

```txt
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy[asyncio]==2.0.30
asyncpg==0.29.0
alembic==1.13.1
pydantic[email]==2.7.1
pydantic-settings==2.2.1
httpx==0.27.0
python-dotenv==1.0.1
```

---

## 11. Domain Configuration

| Service | Domain | Path |
|---------|--------|------|
| Frontend (Next.js) | `nidhamauto.shop` | `/` — all pages |
| Backend API (FastAPI) | `nidhamauto.shop` | `/api/*` — reverse proxy via nginx/Easypanel |

### Nginx / Easypanel Routing Rule
```
location /api {
    proxy_pass http://backend:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location / {
    proxy_pass http://frontend:3000;
}
```

---

## 12. Easypanel Production Setup

1. Create two services: `nidhamauto-frontend` and `nidhamauto-backend`
2. Set domain `nidhamauto.shop` → frontend service
3. Add path rule `/api/*` → backend service
4. Set all environment variables via Easypanel UI (never in Docker image)
5. Run DB migrations once after first deploy:
   ```bash
   docker exec -it nidhamauto-backend alembic upgrade head
   ```
6. Enable SSL via Easypanel (auto Let's Encrypt)

---

## 13. Health Check Endpoint

```python
# backend/app/routers/health.py
from fastapi import APIRouter
router = APIRouter()

@router.get("/health")
async def health():
    return {"status": "ok", "service": "nidhamauto-backend"}
```

Frontend should check `/api/health` on startup for monitoring.
