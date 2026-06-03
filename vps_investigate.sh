#!/bin/bash
# READ-ONLY VPS investigation. Does NOT kill, delete or modify anything.
# Output is printed to screen AND saved to /tmp/vps_report.txt

set +e
export LC_ALL=C
SUSPECT='UcbXaQHdvC'
OUT=/tmp/vps_report.txt
: > "$OUT"
exec > >(tee -a "$OUT") 2>&1

section() { echo ""; echo "=====[ $1 ]====="; }

section "HOST_INFO"
hostname
uname -a
uptime
date -u
cat /etc/os-release 2>/dev/null | head -8

section "LOAD_AND_MEM"
cat /proc/loadavg
free -m
df -hT 2>/dev/null | head -40

section "TOP_CPU_PROCESSES"
ps -eo pid,ppid,user,pcpu,pmem,etime,stat,comm,args --sort=-pcpu | head -30

section "TOP_MEM_PROCESSES"
ps -eo pid,ppid,user,pcpu,pmem,etime,stat,comm,args --sort=-pmem | head -20

section "SEARCH_SUSPECT_NAME"
echo "-- ps grep --"
ps -ef | grep -i "$SUSPECT" | grep -v grep
echo "-- pgrep --"
pgrep -af "$SUSPECT" 2>/dev/null
echo "-- find on disk --"
find / -xdev -iname "*${SUSPECT}*" -not -path "/proc/*" -not -path "/sys/*" 2>/dev/null | head -50

section "SUSPECT_PROCESS_DETAILS"
for P in $(pgrep -f "$SUSPECT" 2>/dev/null); do
  echo "---- PID $P ----"
  echo "cmdline:"; tr '\0' ' ' < /proc/$P/cmdline 2>/dev/null; echo ""
  echo "exe:"; readlink -f /proc/$P/exe 2>/dev/null
  echo "cwd:"; readlink -f /proc/$P/cwd 2>/dev/null
  echo "status:"; grep -E '^(Name|State|PPid|Uid|VmRSS|Threads)' /proc/$P/status 2>/dev/null
  echo "environ:"; tr '\0' '\n' < /proc/$P/environ 2>/dev/null | head -30
  echo "open files (top 30):"; ls -l /proc/$P/fd 2>/dev/null | head -30
  echo "tcp sockets:"; ss -tnp 2>/dev/null | grep ",pid=$P,"
  echo "udp sockets:"; ss -unp 2>/dev/null | grep ",pid=$P,"
done

section "KNOWN_MINER_PATTERNS"
ps -eo pid,user,pcpu,pmem,comm,args | grep -Ei 'xmrig|minerd|cpuminer|kinsing|kdevtmpfsi|kthreaddi|monero|ethminer|nbminer|phoenixminer|gminer|teamtnt|donate.v2|stratum|cryptonight|randomx' | grep -v grep

section "CONNECTIONS_LISTEN"
ss -tulnp 2>/dev/null || netstat -tulnp 2>/dev/null

section "CONNECTIONS_ESTABLISHED"
ss -tnp state established 2>/dev/null | head -100

section "OUTBOUND_MINER_PORTS"
ss -tnp 2>/dev/null | grep -E ':(3333|4444|5555|7777|8333|9999|14444|14433|45700|3032|3030|8888|6666)'

section "DOCKER"
which docker && docker --version 2>/dev/null
docker ps -a --no-trunc 2>/dev/null
echo "-- images --"
docker images 2>/dev/null
for c in $(docker ps -q 2>/dev/null); do
  echo "---- container $c ----"
  docker inspect --format '{{.Name}} | image={{.Config.Image}} | cmd={{.Config.Cmd}} | entry={{.Config.Entrypoint}} | created={{.Created}} | restart={{.HostConfig.RestartPolicy.Name}}' $c 2>/dev/null
done

section "CRON_ROOT"
crontab -l 2>/dev/null
echo "-- /etc/crontab --"
cat /etc/crontab 2>/dev/null
echo "-- /etc/cron.d --"
ls -la /etc/cron.d 2>/dev/null
for f in /etc/cron.d/* /etc/cron.hourly/* /etc/cron.daily/* /etc/cron.weekly/* /etc/cron.monthly/*; do
  [ -f "$f" ] && { echo "==== $f ===="; cat "$f"; }
done

section "CRON_ALL_USERS"
for u in $(cut -d: -f1 /etc/passwd); do
  out=$(crontab -u "$u" -l 2>/dev/null)
  if [ -n "$out" ]; then echo "---- user: $u ----"; echo "$out"; fi
done
ls -la /var/spool/cron 2>/dev/null
ls -la /var/spool/cron/crontabs 2>/dev/null

section "SYSTEMD_RUNNING_UNITS"
systemctl list-units --type=service --state=running --no-pager 2>/dev/null

section "SYSTEMD_ENABLED_UNITS"
systemctl list-unit-files --type=service --state=enabled --no-pager 2>/dev/null

section "SYSTEMD_RECENT_UNIT_FILES"
find /etc/systemd /lib/systemd /usr/lib/systemd /run/systemd -name "*.service" -mtime -30 2>/dev/null | head -40

section "RCLOCAL_AND_PROFILES"
cat /etc/rc.local 2>/dev/null
ls -la /etc/profile.d 2>/dev/null
ls -la /root/.bashrc /root/.bash_profile /root/.profile /root/.bash_login 2>/dev/null
for f in /root/.bashrc /root/.bash_profile /root/.profile; do
  [ -f "$f" ] && { echo "==== $f ===="; cat "$f"; }
done

section "AUTHORIZED_KEYS"
for f in /root/.ssh/authorized_keys /home/*/.ssh/authorized_keys; do
  [ -f "$f" ] && { echo "==== $f ===="; ls -la "$f"; cat "$f"; }
done

section "SSH_CONFIG"
grep -Ei 'PermitRootLogin|PasswordAuthentication|Port ' /etc/ssh/sshd_config 2>/dev/null

section "RECENTLY_MODIFIED_FILES"
for d in /tmp /var/tmp /dev/shm /root /var/spool /etc /usr/local /opt /home; do
  echo "==== $d (mtime <14 days) ===="
  find "$d" -xdev -mtime -14 -type f 2>/dev/null | head -50
done

section "HIDDEN_FILES_TMP_LIKE"
ls -la /tmp /var/tmp /dev/shm 2>/dev/null

section "WORLD_WRITABLE_RECENT"
find / -xdev -type f -perm -0002 -mtime -14 2>/dev/null | head -50

section "BIG_BINARIES_TMP"
find /tmp /var/tmp /dev/shm /root -xdev -type f -size +1M 2>/dev/null | head -30

section "RECENT_AUTH_LOG"
tail -n 80 /var/log/auth.log 2>/dev/null || journalctl -u ssh -n 80 --no-pager 2>/dev/null

section "LAST_LOGINS"
last -n 25 2>/dev/null

section "WHO"
who -a 2>/dev/null

section "IPTABLES"
iptables -L -n -v 2>/dev/null | head -100

section "LD_PRELOAD_CHECK"
cat /etc/ld.so.preload 2>/dev/null
echo "(empty means no preload, which is good)"

section "HOSTS"
cat /etc/hosts 2>/dev/null
cat /etc/resolv.conf 2>/dev/null

section "PACKAGE_MANAGER_RECENT"
ls -lat /var/log/dpkg.log 2>/dev/null
grep " install " /var/log/dpkg.log 2>/dev/null | tail -30
grep " install " /var/log/apt/history.log 2>/dev/null | tail -10

section "USERS_AND_GROUPS"
echo "-- /etc/passwd (UID 0 + recent) --"
awk -F: '$3==0 {print}' /etc/passwd
ls -la /etc/passwd /etc/shadow /etc/group 2>/dev/null
echo "-- recently modified user accounts --"
find /etc -maxdepth 1 -name 'passwd*' -o -name 'shadow*' -o -name 'group*' | xargs ls -la 2>/dev/null

echo ""
echo "=====[ END_OF_REPORT ]====="
echo "Full report saved to: $OUT"
