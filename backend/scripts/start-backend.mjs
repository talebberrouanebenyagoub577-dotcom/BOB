/**
 * Starts FastAPI on :8000 with backend/.venv (Python 3.11–3.12.x).
 * If port 8000 is already taken (e.g. Docker backend), exits 0 and skips —
 * avoids a second crashing uvicorn and confused 500s on /admin/*.
 */
import net from "node:net";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.resolve(__dirname, "..");
const REQ = path.join(BACKEND_ROOT, "requirements.txt");
const MARKER = path.join(BACKEND_ROOT, ".venv", ".requirements-installed.json");
const API_PORT = 8000;

const CHECK = [
  "-c",
  "import sys\nif sys.version_info[:2] < (3, 11): raise SystemExit(2)\nif sys.version_info >= (3, 14): raise SystemExit(2)\n",
];

/** True if something is already listening on host:port (e.g. Docker FastAPI). */
function isPortTaken(port, host = "0.0.0.0") {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once("error", (err) => {
      resolve(err.code === "EADDRINUSE");
    });
    s.listen(port, host, () => {
      s.close(() => resolve(false));
    });
  });
}

function venvPython() {
  return process.platform === "win32"
    ? path.join(BACKEND_ROOT, ".venv", "Scripts", "python.exe")
    : path.join(BACKEND_ROOT, ".venv", "bin", "python");
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: BACKEND_ROOT, stdio: "inherit" });
  if (r.error) throw r.error;
  if ((r.status ?? 1) !== 0) process.exit(r.status ?? 1);
}

function interpreterPath(command, prefixArgs = []) {
  const r = spawnSync(command, [...prefixArgs, ...CHECK], {
    cwd: BACKEND_ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (r.error?.code === "ENOENT") return null;
  if (r.status !== 0) return null;
  const out = spawnSync(command, [...prefixArgs, "-c", "import sys; print(sys.executable)"], {
    cwd: BACKEND_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (out.error?.code === "ENOENT") return null;
  if (out.status !== 0) return null;
  return (out.stdout ?? "").trim();
}

function findSystemPython() {
  if (process.platform === "win32") {
    for (const minor of ["-3.12", "-3.11"]) {
      const p = interpreterPath("py", [minor]);
      if (p) return p;
    }
  }
  for (const cmd of ["python3", "python"]) {
    const p = interpreterPath(cmd);
    if (p) return p;
  }
  return null;
}

function depsNeedInstall() {
  const pyPath = venvPython();
  if (!fs.existsSync(pyPath)) return true;

  let reqMtimeMs = NaN;
  try {
    reqMtimeMs = fs.statSync(REQ).mtimeMs;
  } catch {
    return true;
  }

  try {
    const rec = JSON.parse(fs.readFileSync(MARKER, "utf8"));
    const saved = Number(rec.reqMtimeMs);
    if (!Number.isFinite(saved) || saved < reqMtimeMs) return true;
  } catch {
    return true;
  }

  const testDep = spawnSync(
    pyPath,
    [
      "-c",
      "import asyncpg, pydantic, uvicorn; import tzdata; from zoneinfo import ZoneInfo; ZoneInfo('Asia/Riyadh')",
    ],
    {
      cwd: BACKEND_ROOT,
      stdio: "ignore",
    }
  );
  return testDep.status !== 0;
}

function writeDepsMarker(reqMtimeMs) {
  const dir = path.dirname(MARKER);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    MARKER,
    `${JSON.stringify({ reqMtimeMs, installedAt: new Date().toISOString() })}\n`
  );
}

async function main() {
  if (await isPortTaken(API_PORT)) {
    console.log(
      `[backend] Port ${API_PORT} already in use — skipping local Uvicorn (often Docker). Vite proxies /admin/* here.`
    );
    process.exit(0);
    return;
  }

  const exe = findSystemPython();
  if (!exe) {
    console.error(
      "[backend] Install Python 3.11 or 3.12 (not 3.14). https://www.python.org/downloads/ — on Windows enable the \"py\" launcher."
    );
    process.exit(1);
  }

  const pyPath = venvPython();
  if (!fs.existsSync(pyPath)) {
    console.log(`[backend] Creating .venv with:\n  ${exe}`);
    run(exe, ["-m", "venv", ".venv"]);
  }

  let reqStat;
  try {
    reqStat = fs.statSync(REQ);
  } catch {
    console.error("[backend] Missing requirements.txt");
    process.exit(1);
  }

  if (depsNeedInstall()) {
    console.log("[backend] pip install -r requirements.txt …");
    run(pyPath, ["-m", "pip", "install", "-q", "-U", "pip"]);
    run(pyPath, ["-m", "pip", "install", "-q", "-r", "requirements.txt"]);
    writeDepsMarker(reqStat.mtimeMs);
  }

  console.log(`[backend] Uvicorn http://127.0.0.1:${API_PORT} (listening 0.0.0.0:${API_PORT})`);
  run(pyPath, ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", String(API_PORT)]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
