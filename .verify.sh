#!/bin/bash
set +e

echo '=== [1] Traefik routes (internal API) ==='
docker exec traefik wget -qO- http://localhost:8080/api/http/routers 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); [print(r['name'],'->',r.get('rule',''),'  status:',r.get('status','')) for r in d]" 2>/dev/null || echo "(traefik API not exposed, that is fine)"

echo
echo '=== [2] Backend health (via Docker network) ==='
docker run --rm --network bob_internal curlimages/curl:latest \
  -sS -o /dev/null -w 'GET http://nidhamauto_backend:8000/health -> HTTP %{http_code}\n' \
  http://nidhamauto_backend:8000/health

echo
echo '=== [3] Frontend (via Docker network) ==='
docker run --rm --network traefik-web curlimages/curl:latest \
  -sS -o /dev/null -w 'GET http://nidhamauto_frontend:3000/ -> HTTP %{http_code}\n' \
  http://nidhamauto_frontend:3000/

echo
echo '=== [4] LE cert status ==='
docker exec traefik ls -la /letsencrypt/ 2>/dev/null
docker exec traefik cat /letsencrypt/acme.json 2>/dev/null | python3 -c "
import sys, json
d = json.load(sys.stdin)
le = d.get('le', {})
print('account email:', le.get('Account', {}).get('Email', '?'))
certs = le.get('Certificates') or []
print('certificates issued:', len(certs))
for c in certs:
    print('  -', c.get('domain', {}).get('main'), 'SANs:', c.get('domain', {}).get('sans'))
" 2>/dev/null || echo "(acme.json not yet populated)"

echo
echo '=== [5] HTTPS reachability from VPS to itself (origin-only, no CF) ==='
for h in nidhamauto.shop api.nidhamauto.shop; do
  echo "-- $h --"
  curl -sS --resolve "$h:443:127.0.0.1" -o /dev/null -w "  origin-direct HTTPS: %{http_code}  cert: %{ssl_verify_result}\n" "https://$h/" 2>&1 | head -3
done

echo
echo '=== [6] HTTPS via DNS (through Cloudflare) ==='
for h in nidhamauto.shop api.nidhamauto.shop; do
  echo "-- $h --"
  curl -sS -o /dev/null -w "  via DNS HTTPS: %{http_code}\n" --max-time 15 "https://$h/health" 2>&1 | head -3
done

echo
echo '=== [7] Traefik logs (last 15) ==='
docker logs --tail=15 traefik 2>&1

echo
echo '=== [8] Final external port listing ==='
ss -tlnp4 | awk 'NR>1 {split($4,a,":"); print a[length(a)]}' | sort -u

echo
echo '=== VERIFICATION COMPLETE ==='
