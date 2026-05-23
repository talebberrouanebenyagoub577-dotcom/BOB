/**
 * Frees conflicting dev listeners.
 *
 * Usage:
 *   node scripts/free-dev-ports.mjs          → 5173, 8787 (default — safe when Docker uses :8000)
 *   node scripts/free-dev-ports.mjs next     → 3000 (Next.js frontend dev)
 */
import { spawnSync } from "node:child_process";

const mode = (process.argv[2] || "storefront").toLowerCase();
const STOREFRONT_PORTS = [5173, 8787];
const NEXT_PORTS = [3000];
const PORTS =
  mode === "all"
    ? [...STOREFRONT_PORTS, 8000]
    : mode === "next"
      ? NEXT_PORTS
      : STOREFRONT_PORTS;

function freeWindows() {
  for (const port of PORTS) {
    const ps = [
      "-NoProfile",
      "-Command",
      `$x = Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Where-Object State -eq Listen; if ($x) { $x | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }`,
    ];
    spawnSync("powershell.exe", ps, { stdio: "inherit", shell: false });
  }
}

function freeUnix() {
  for (const port of PORTS) {
    spawnSync(
      "sh",
      [
        "-c",
        `pids=$(lsof -ti:${port} 2>/dev/null) && [ -n "$pids" ] && kill -9 $pids 2>/dev/null; true`,
      ],
      { stdio: "ignore", shell: false }
    );
  }
}

console.log(`[dev] Freeing ports (${mode}): ${PORTS.join(", ")}`);
if (process.platform === "win32") freeWindows();
else freeUnix();
console.log("[dev] Done. Run: npm run dev");
