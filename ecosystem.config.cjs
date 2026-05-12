const path = require("path");

const ROOT = path.join(__dirname, ".");

module.exports = {
  apps: [
    {
      name: "frontend",
      script: path.join(process.env.SystemRoot || "C:/Windows", "System32/cmd.exe"),
      args: "/c npx vite --host 0.0.0.0",
      cwd: ROOT,
      interpreter: "none",
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "api",
      script: path.join(ROOT, "server/index.js"),
      cwd: ROOT,
      env: {
        NODE_ENV: "development",
        PORT: "8787",
      },
    },
    {
      name: "fastapi",
      script: path.join(ROOT, "backend/scripts/start-backend.mjs"),
      cwd: ROOT,
      interpreter: "node",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
