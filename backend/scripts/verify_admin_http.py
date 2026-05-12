"""Smoke-test /health + admin JWT + DB routes (prefer running inside Compose backend).

Host `127.0.0.1:8000` may hit a stray local Uvicorn if another process binds :8000; use:

  npm run verify:docker-backend
"""
from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def parse_dotenv(raw: str) -> dict[str, str]:
    d: dict[str, str] = {}
    for line in raw.splitlines():
        line = line.split("#", 1)[0].strip()
        if not line or "=" not in line:
            continue
        k, _, v = line.partition("=")
        d[k.strip()] = v.strip().strip('"').strip("'")
    return d


def load_admin_login() -> dict[str, str]:
    scripts_dir = Path(__file__).resolve().parent
    backend_root = scripts_dir.parent  # …/backend on host, /app in container
    env_path = backend_root / ".env"
    if env_path.is_file():
        d = parse_dotenv(env_path.read_text(encoding="utf-8"))
        return {"username": d["ADMIN_USERNAME"], "password": d["ADMIN_PASSWORD"]}
    u = os.environ.get("ADMIN_USERNAME", "").strip()
    p = os.environ.get("ADMIN_PASSWORD", "").strip()
    if not u or not p:
        print(
            "Missing ADMIN_USERNAME / ADMIN_PASSWORD (no backend/.env in image). "
            + "Run via: docker compose run --rm -e ADMIN_USERNAME ... or npm run verify:docker-backend.",
            file=sys.stderr,
        )
        raise SystemExit(1)
    return {"username": u, "password": p}


def open_url(req: Request, timeout: float = 15, retries: int = 15, delay: float = 2.0):
    last: Exception | None = None
    for attempt in range(retries):
        try:
            return urlopen(req, timeout=timeout)
        except URLError as e:
            last = e
            if isinstance(e.reason, ConnectionRefusedError) and attempt < retries - 1:
                time.sleep(delay)
                continue
            raise
    assert last
    raise last


def main() -> int:
    login = load_admin_login()
    api = os.environ.get("VERIFY_API_BASE", "http://127.0.0.1:8000").rstrip("/")

    try:
        with open_url(Request(f"{api}/health")) as h:
            body = json.loads(h.read().decode())
            print("health", h.status, body)
    except HTTPError as e:
        print("health FAILED", e.code, file=sys.stderr)
        return 1

    lr = Request(
        f"{api}/admin/auth/login",
        data=json.dumps(login).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(lr, timeout=15) as resp:
            tok = json.loads(resp.read().decode()).get("access_token", "")
            print("login", resp.status, "token_len", len(tok))
    except HTTPError as e:
        err = e.read().decode(errors="replace")
        print("login FAILED", e.code, err[:400], file=sys.stderr)
        return 1

    if not tok:
        print("FAIL: missing access_token", file=sys.stderr)
        return 1

    auth = {"Authorization": f"Bearer {tok}", "Accept": "application/json"}
    q = "from=2026-01-01&to=2026-05-31"
    mr = Request(f"{api}/admin/metrics?{q}", headers=auth)
    try:
        with urlopen(mr, timeout=15) as resp:
            m = json.loads(resp.read().decode())
            print("metrics", resp.status, "keys_preview", sorted(m.keys())[:10])
    except HTTPError as e:
        err = e.read().decode(errors="replace")
        print("metrics FAILED", e.code, err[:600], file=sys.stderr)
        return 1

    orr = Request(f"{api}/admin/orders", headers=auth)
    try:
        with urlopen(orr, timeout=15) as resp:
            orders = json.loads(resp.read().decode())
            n = len(orders) if isinstance(orders, list) else orders
            print("orders", resp.status, "items", n)
    except HTTPError as e:
        err = e.read().decode(errors="replace")
        print("orders FAILED", e.code, err[:600], file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
