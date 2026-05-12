import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function startProcess(name, cmd, args, env = {}) {
  const proc = spawn(cmd, args, {
    cwd: __dirname,
    shell: true,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });

  proc.on("error", (err) => console.error(`[${name}] Error:`, err.message));
  proc.on("exit", (code) => console.log(`[${name}] exited with code ${code}`));
  return proc;
}

console.log("Starting Frontend (Vite) on port 5173...");
startProcess("frontend", "npx", ["vite", "--host", "0.0.0.0"], {
  NODE_ENV: "development",
});

console.log("Starting API (Express) on port 8787...");
startProcess("api", "node", ["server/index.js"], {
  NODE_ENV: "development",
  PORT: "8787",
});

console.log("Starting FastAPI backend on port 8000 (venv + deps via start-backend.mjs)…");
startProcess("fastapi", "node", ["backend/scripts/start-backend.mjs"], {
  NODE_ENV: "development",
});

process.on("SIGINT", () => {
  console.log("\nShutting down...");
  process.exit(0);
});
