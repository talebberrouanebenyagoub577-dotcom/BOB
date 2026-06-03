#!/bin/bash
# Phase 2: lockdown + remove Easypanel + full hardening. Idempotent.
set -e
export DEBIAN_FRONTEND=noninteractive
NEWPW="__NEW_ROOT_PASSWORD__"

echo "=== [1] Rotating root password ==="
echo "root:$NEWPW" | chpasswd

echo "=== [2] Disabling SSH password auth ==="
cp -n /etc/ssh/sshd_config /etc/ssh/sshd_config.orig.$(date +%s) 2>/dev/null || true
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/'                /etc/ssh/sshd_config
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/'                /etc/ssh/sshd_config
sed -i 's/^#\?KbdInteractiveAuthentication.*/KbdInteractiveAuthentication no/'   /etc/ssh/sshd_config
sed -i 's/^#\?ChallengeResponseAuthentication.*/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?X11Forwarding.*/X11Forwarding no/'                                  /etc/ssh/sshd_config
sshd -t && systemctl restart ssh

echo "=== [3] Removing Easypanel + leaving Docker Swarm ==="
docker service rm $(docker service ls -q) 2>/dev/null || true
docker stack rm $(docker stack ls --format '{{.Name}}') 2>/dev/null || true
sleep 5
docker swarm leave --force 2>/dev/null || true
docker stop $(docker ps -q) 2>/dev/null || true
docker rm -f $(docker ps -aq) 2>/dev/null || true
rm -rf /etc/easypanel 2>/dev/null || true
docker network prune -f 2>/dev/null || true
echo "After cleanup:"
docker ps -a
docker info 2>&1 | grep -E '^ Swarm' | head -1

echo "=== [4] System update + base tools ==="
apt update -qq
apt -y full-upgrade -qq
apt -y install ufw fail2ban unattended-upgrades apt-listchanges htop ncdu jq git tmux ca-certificates curl gnupg lsb-release -qq
apt -y autoremove -qq

echo "=== [5] UFW (default-deny, only 22/80/443 + Hostinger console) ==="
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp                    comment 'ssh'
ufw allow 80/tcp                    comment 'http'
ufw allow 443/tcp                   comment 'https'
ufw allow from 169.254.0.0/16       comment 'hostinger console'
ufw deny  out to 103.141.13.55      comment 'old pg_mem c2'
ufw deny  out to 157.230.85.81      comment 'old pg_mem fallback'
ufw --force enable

echo "=== [6] fail2ban for SSH ==="
cat > /etc/fail2ban/jail.d/sshd.local <<EOF
[sshd]
enabled  = true
mode     = aggressive
maxretry = 5
findtime = 600
bantime  = 86400
EOF
systemctl enable --now fail2ban

echo "=== [7] Unattended security updates ==="
cat > /etc/apt/apt.conf.d/20auto-upgrades <<EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
systemctl enable --now unattended-upgrades

echo "=== [8] Lock cron to root only ==="
echo root > /etc/cron.allow
chmod 600 /etc/cron.allow

echo "=== [9] Hostname + timezone ==="
hostnamectl set-hostname bob-prod-01
timedatectl set-timezone Africa/Algiers

echo
echo "=== HARDENING COMPLETE ==="
echo "--- ssh config ---"
sshd -T 2>/dev/null | grep -E '^(permitrootlogin|passwordauth|pubkeyauth) ' | sort
echo "--- ufw ---"
ufw status verbose
echo "--- fail2ban ---"
systemctl is-active fail2ban
echo "--- listening ports (should be only 22/80/443 + local) ---"
ss -tlnp
echo "--- docker swarm (should NOT be active) ---"
docker info 2>&1 | grep -E '^ Swarm' | head -1
