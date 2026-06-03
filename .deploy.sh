#!/bin/bash
# Phase 4-7: Deploy Traefik + clone BOB + bring up stack
set -e

LE_EMAIL="__LE_EMAIL__"
PG_PASS="__PG_PASS__"
SECRET_KEY="__SECRET_KEY__"
ADMIN_JWT="__ADMIN_JWT__"
ADMIN_PASS="__ADMIN_PASS__"
APPSCRIPT_URL="__APPSCRIPT_URL__"

echo "=== [1] Docker sanity ==="
docker --version
systemctl is-active docker
docker info 2>&1 | grep -E '(Server Version|Storage Driver|Swarm)' | head -3

echo "=== [2] Set up Traefik in /opt/traefik ==="
mkdir -p /opt/traefik
cd /opt/traefik
cat > docker-compose.yml <<EOF
services:
  traefik:
    image: traefik:v3.1
    container_name: traefik
    restart: unless-stopped
    command:
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --providers.docker.network=traefik-web
      - --entrypoints.web.address=:80
      - --entrypoints.web.http.redirections.entryPoint.to=websecure
      - --entrypoints.web.http.redirections.entryPoint.scheme=https
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.le.acme.email=${LE_EMAIL}
      - --certificatesresolvers.le.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.le.acme.httpchallenge.entrypoint=web
      - --log.level=INFO
      - --accesslog=false
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt
    networks:
      - traefik-web

networks:
  traefik-web:
    name: traefik-web
    external: true

volumes:
  letsencrypt:
EOF

# Create the shared network in advance so BOB compose can reference it
docker network rm traefik-web 2>/dev/null || true
docker network create --driver bridge traefik-web

cd /opt/traefik && docker compose up -d
sleep 5
docker compose logs --tail=10 traefik

echo "=== [3] Clone BOB from GitHub ==="
mkdir -p /opt && cd /opt
rm -rf BOB
git clone https://github.com/talebberrouanebenyagoub577-dotcom/BOB.git
cd /opt/BOB

echo "=== [4] Write .env files with strong secrets ==="
cat > /opt/BOB/.env <<EOF
POSTGRES_USER=nidhamauto
POSTGRES_DB=nidhamauto
POSTGRES_PASSWORD=${PG_PASS}
GOOGLE_SHEETS_WEBHOOK_URL=${APPSCRIPT_URL}
FRONTEND_INTERNAL_PORT=3000
NEXT_PUBLIC_API_URL=https://api.nidhamauto.shop
EOF
chmod 600 /opt/BOB/.env

mkdir -p /opt/BOB/backend
cat > /opt/BOB/backend/.env <<EOF
APP_ENV=production
APP_NAME=NidhamAuto API
API_BASE_URL=https://api.nidhamauto.shop
FRONTEND_URL=https://nidhamauto.shop
POSTGRES_USER=nidhamauto
POSTGRES_PASSWORD=${PG_PASS}
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_DB=nidhamauto
CORS_ORIGINS=https://nidhamauto.shop,https://www.nidhamauto.shop
GOOGLE_SHEETS_WEBHOOK_URL=${APPSCRIPT_URL}
SECRET_KEY=${SECRET_KEY}
ADMIN_USERNAME=admin
ADMIN_PASSWORD=${ADMIN_PASS}
ADMIN_JWT_SECRET=${ADMIN_JWT}
WHITELISTED_PHONES=+966550603
LOG_LEVEL=INFO
EOF
chmod 600 /opt/BOB/backend/.env

mkdir -p /opt/BOB/frontend
cat > /opt/BOB/frontend/.env <<EOF
NEXT_PUBLIC_API_URL=https://api.nidhamauto.shop
NEXT_PUBLIC_ENABLE_PIXELS=true
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
NEXT_PUBLIC_SNAP_PIXEL_ID=
EOF
chmod 600 /opt/BOB/frontend/.env

echo "=== [5] Patch BOB docker-compose.yml to use external traefik-web network ==="
# Make BOB's "web" network refer to the existing external traefik-web
python3 - <<'PYEOF'
import re, pathlib
p = pathlib.Path('/opt/BOB/docker-compose.yml')
s = p.read_text()
# Replace the "web:" network block under top-level "networks:" with external ref
s = re.sub(
    r'^networks:\s*\n(\s+internal:\s*\n\s+driver:\s+bridge\s*\n)\s+web:\s*\n\s+driver:\s+bridge',
    r'networks:\n\1  web:\n    name: traefik-web\n    external: true',
    s, flags=re.MULTILINE
)
p.write_text(s)
print("Network section patched.")
print("--- networks section now ---")
print('\n'.join(s.splitlines()[-10:]))
PYEOF

echo "=== [6] Bring up DB first, wait healthy, then full stack ==="
cd /opt/BOB
docker compose up -d db
echo "Waiting for DB to be healthy..."
for i in $(seq 1 30); do
  if docker exec nidhamauto_database pg_isready -U nidhamauto >/dev/null 2>&1; then
    echo "DB ready after ${i}s"
    break
  fi
  sleep 1
done

echo "=== [7] Bring up backend + frontend (will pull images from GHCR or build) ==="
docker compose up -d
sleep 20

echo "=== [8] Status ==="
docker compose ps
echo
echo "--- BOB compose logs (last 20 each) ---"
docker compose logs --tail=20 backend 2>&1 | head -30
docker compose logs --tail=20 frontend 2>&1 | head -30

echo "=== [9] External port verification ==="
ss -tlnp | grep -E ':(22|80|443|3000|8000|5432) '
echo
echo "=== DEPLOY COMPLETE ==="
