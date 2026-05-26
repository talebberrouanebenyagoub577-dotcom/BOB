#!/usr/bin/env bash
# Verify nidhamauto.shop stack on VPS. Run as root after EasyPanel deploy.
set -euo pipefail

DOMAIN="${DOMAIN:-nidhamauto.shop}"
API_DOMAIN="${API_DOMAIN:-api.nidhamauto.shop}"
PROJECT="${PROJECT:-nidhamauto}"
NET="${NET:-easypanel}"

fail=0
ok() { printf 'OK  %s\n' "$*"; }
bad() { printf 'FAIL %s\n' "$*"; fail=1; }

echo "=== Docker version ==="
docker version --format 'Server: {{.Server.Version}}' || bad "docker not running"

echo "=== Swarm services ==="
docker service ls | grep -E "${PROJECT}|easypanel" || bad "no project services"

for svc in "${PROJECT}_frontend" "${PROJECT}_backend" "${PROJECT}_db" "${PROJECT}_database"; do
  if docker service inspect "$svc" >/dev/null 2>&1; then
    replicas="$(docker service ls --filter name="$svc" --format '{{.Replicas}}')"
    echo "  ${svc}: ${replicas}"
    [[ "$replicas" == "1/1" ]] || bad "${svc} not 1/1"
  fi
done

echo "=== In-network frontend ==="
if docker network inspect "$NET" >/dev/null 2>&1; then
  code="$(docker run --rm --network "$NET" curlimages/curl:8.5.0 \
    -sS -o /dev/null -w '%{http_code}' -H "Host: ${DOMAIN}" "http://${PROJECT}_frontend:3000/" || echo 000)"
  [[ "$code" == "200" ]] && ok "frontend ${PROJECT}_frontend:3000 -> ${code}" || bad "frontend in-network HTTP ${code}"
else
  bad "network ${NET} missing"
fi

echo "=== In-network backend health ==="
code="$(docker run --rm --network "$NET" curlimages/curl:8.5.0 \
  -sS -o /dev/null -w '%{http_code}' "http://${PROJECT}_backend:8000/health" || echo 000)"
[[ "$code" == "200" ]] && ok "backend /health -> ${code}" || bad "backend health HTTP ${code}"

echo "=== Traefik HTTPS (local) ==="
code="$(curl -sS -o /dev/null -w '%{http_code}' -H "Host: ${DOMAIN}" https://127.0.0.1 -k || echo 000)"
[[ "$code" == "200" ]] && ok "traefik https://${DOMAIN} -> ${code}" || bad "traefik local HTTPS ${code}"

echo "=== Public URLs ==="
pub="$(curl -sS -o /dev/null -w '%{http_code}' "https://${DOMAIN}/" || echo 000)"
[[ "$pub" == "200" ]] && ok "public https://${DOMAIN} -> ${pub}" || bad "public shop HTTP ${pub}"

api="$(curl -sS -o /dev/null -w '%{http_code}' "https://${API_DOMAIN}/health" || echo 000)"
[[ "$api" == "200" ]] && ok "public https://${API_DOMAIN}/health -> ${api}" || bad "public api HTTP ${api}"

echo "=== Frontend env (must include HOSTNAME=0.0.0.0) ==="
if docker service inspect "${PROJECT}_frontend" >/dev/null 2>&1; then
  docker service inspect "${PROJECT}_frontend" --format '{{range .Spec.TaskTemplate.ContainerSpec.Env}}{{println .}}{{end}}' \
    | grep -E '^(HOSTNAME|PORT)=' || bad "HOSTNAME/PORT not set on frontend"
fi

if [[ "$fail" -eq 0 ]]; then
  echo "ALL CHECKS PASSED"
  exit 0
fi
echo "SOME CHECKS FAILED — fix EasyPanel domains/ports/env then re-run."
exit 1
