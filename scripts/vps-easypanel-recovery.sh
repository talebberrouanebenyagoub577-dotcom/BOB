#!/usr/bin/env bash
# Nidhamauto VPS recovery: Docker 28.x + EasyPanel + Swarm cleanup.
# Run on the VPS as root: bash vps-easypanel-recovery.sh
#
# Does NOT touch GitHub. Does NOT delete /var/lib/docker (you already reinitialized).
# Backs up /etc/easypanel before reinstall.

set -euo pipefail

TARGET_DOCKER_PREFIX="5:28.5.1"
EASYPANEL_DOMAIN="${EASYPANEL_DOMAIN:-nidhamauto.shop}"
PROJECT_NAME="${PROJECT_NAME:-nidhamauto}"

log() { printf '\n==> %s\n' "$*"; }
warn() { printf 'WARN: %s\n' "$*" >&2; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

require_root() {
  [[ "${EUID:-$(id -u)}" -eq 0 ]] || die "Run as root"
}

docker_server_version() {
  docker version --format '{{.Server.Version}}' 2>/dev/null || echo "unknown"
}

pin_docker_if_needed() {
  local ver
  ver="$(docker_server_version)"
  log "Docker server version: ${ver}"

  if [[ "${ver}" == 29.* ]]; then
    warn "Docker 29.x breaks EasyPanel (semver TypeError). Pinning to ${TARGET_DOCKER_PREFIX}..."
    apt-get update -qq
    local pkg
    pkg="$(apt-cache madison docker-ce 2>/dev/null | awk -v p="${TARGET_DOCKER_PREFIX}" '$3 ~ p {print $3; exit}')"
    [[ -n "${pkg}" ]] || die "docker-ce ${TARGET_DOCKER_PREFIX} not found. Run: apt-cache madison docker-ce"

    systemctl stop docker docker.socket 2>/dev/null || true
    DEBIAN_FRONTEND=noninteractive apt-get install -y --allow-downgrades \
      "docker-ce=${pkg}" \
      "docker-ce-cli=${pkg}" \
      containerd.io \
      docker-buildx-plugin \
      docker-compose-plugin
    apt-mark hold docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin || true
    systemctl enable --now docker
    log "Pinned docker-ce to ${pkg}"
  else
    log "Docker version OK for EasyPanel (not 29.x)"
  fi
}

ensure_swarm() {
  if docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null | grep -q active; then
    log "Swarm already active"
  else
    log "Initializing Swarm..."
    docker swarm init --advertise-addr "$(hostname -I | awk '{print $1}')" || docker swarm init
  fi
}

safe_prune() {
  log "Removing stopped containers, unused networks, dangling images (keeping named volumes)..."
  docker container prune -f
  docker network prune -f
  docker image prune -af
  # Intentionally NOT: docker volume prune (DB data lives in volumes)
}

remove_broken_easypanel() {
  log "Stopping EasyPanel / Traefik swarm services if present..."
  docker service rm easypanel easypanel-traefik 2>/dev/null || true
  sleep 5
  docker ps -aq --filter name=easypanel | xargs -r docker rm -f 2>/dev/null || true
}

backup_and_reset_easypanel_config() {
  if [[ -d /etc/easypanel ]]; then
    local bak="/etc/easypanel.bak.$(date +%Y%m%d-%H%M%S)"
    log "Backing up /etc/easypanel -> ${bak}"
    cp -a /etc/easypanel "${bak}"
    rm -rf /etc/easypanel/traefik/config/custom-nidhamauto.yaml 2>/dev/null || true
  fi
}

install_easypanel() {
  log "Installing EasyPanel (setup)..."
  docker pull easypanel/easypanel:latest
  docker run --rm \
    -v /etc/easypanel:/etc/easypanel \
    -v /var/run/docker.sock:/var/run/docker.sock:ro \
    easypanel/easypanel setup

  sleep 15
  docker service ls | grep -E 'easypanel|traefik' || warn "EasyPanel services not listed yet"
}

wait_easypanel() {
  local i
  for i in $(seq 1 30); do
    if curl -fsS --max-time 3 http://127.0.0.1:3000 >/dev/null 2>&1; then
      log "EasyPanel UI responding on :3000"
      return 0
    fi
    sleep 2
  done
  warn "EasyPanel UI not responding on :3000 — check: docker service logs easypanel --tail 30"
}

set_restart_policies() {
  log "Setting restart policies on nidhamauto services (if they exist)..."
  for svc in "${PROJECT_NAME}_frontend" "${PROJECT_NAME}_backend" "${PROJECT_NAME}_db" "${PROJECT_NAME}_database" easypanel easypanel-traefik; do
    if docker service inspect "${svc}" >/dev/null 2>&1; then
      docker service update \
        --restart-condition any \
        --restart-delay 5s \
        --restart-max-attempts 0 \
        "${svc}" >/dev/null 2>&1 || true
      log "  restart-policy: ${svc}"
    fi
  done
}

print_next_steps() {
  cat <<EOF

============================================================
EasyPanel base install done.
============================================================

1) Open panel (SSH tunnel if port 3000 blocked):
     ssh -N -L 3000:127.0.0.1:3000 root@$(curl -s ifconfig.me 2>/dev/null || echo YOUR_VPS_IP)
     http://127.0.0.1:3000

2) Create project: ${PROJECT_NAME}

3) Import or recreate services from repo easypanel.json (GitHub BOB).

4) Required env (see deploy/EASYPANEL_ENV.example.txt):

   DATABASE / db service:
     POSTGRES_USER=nidhamauto
     POSTGRES_PASSWORD=<strong-password>

   backend:
     POSTGRES_HOST=${PROJECT_NAME}_db
     POSTGRES_USER=nidhamauto
     POSTGRES_PASSWORD=<same-as-db>
     POSTGRES_DB=nidhamauto
     POSTGRES_PORT=5432
     FRONTEND_URL=https://${EASYPANEL_DOMAIN}
     SECRET_KEY=<random>
     ADMIN_USERNAME=...
     ADMIN_PASSWORD=...

   frontend:
     HOSTNAME=0.0.0.0
     PORT=3000
     BACKEND_INTERNAL_URL=http://${PROJECT_NAME}_backend:8000
     NEXT_PUBLIC_API_URL=https://api.${EASYPANEL_DOMAIN}

5) Domains (Domain & Proxy port MUST match app listen port):
     frontend: ${EASYPANEL_DOMAIN}  -> port 3000
     backend:  api.${EASYPANEL_DOMAIN} -> port 8000

6) After deploy, run verification:
     bash scripts/vps-verify-nidhamauto.sh

7) Pin Docker (already done if 29.x was detected):
     apt-mark showhold | grep docker

EOF
}

main() {
  require_root
  log "Nidhamauto VPS recovery — project=${PROJECT_NAME} domain=${EASYPANEL_DOMAIN}"
  pin_docker_if_needed
  ensure_swarm
  safe_prune
  remove_broken_easypanel
  backup_and_reset_easypanel_config
  install_easypanel
  wait_easypanel
  set_restart_policies
  print_next_steps
}

main "$@"
