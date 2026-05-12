"""POST test row to Google Apps Script webhook (stdlib only). Same redirect behavior as app.services.webhook."""
from __future__ import annotations

import json
import re
import ssl
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urljoin

# Riyadh = UTC+3 (avoid ZoneInfo on Windows without tzdata)
_RIYADH = timezone(timedelta(hours=3))


def load_webhook_url() -> str:
    from pathlib import Path

    env = Path(__file__).resolve().parent / ".env"
    if not env.is_file():
        return ""
    for line in env.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.strip()
        if line.startswith("GOOGLE_SHEETS_WEBHOOK_URL="):
            v = line.split("=", 1)[1].strip().strip('"').strip("'")
            if v.startswith("//"):
                v = "https:" + v
            return v
    return ""


def post_apps_script_webhook(start_url: str, payload: dict[str, Any]) -> tuple[int, str]:
    """POST JSON; on 301/302/307/308 replay POST to Location (Apps Script quirk)."""
    ctx = ssl.create_default_context()
    data = json.dumps(payload).encode("utf-8")
    current = start_url.strip()
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "nidhamauto-sheet-test/1",
    }
    last_body = ""
    last_code = 0
    for _ in range(8):
        req = urllib.request.Request(current, data=data, method="POST", headers=headers)
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
                last_code = resp.getcode() or 200
                last_body = resp.read().decode("utf-8", errors="replace")
                return last_code, last_body
        except urllib.error.HTTPError as e:
            last_code = e.code
            last_body = e.read().decode("utf-8", errors="replace")
            if e.code in (301, 302, 307, 308):
                loc = e.headers.get("Location")
                if loc:
                    current = loc if loc.startswith("http") else urljoin(str(e.url), loc)
                    continue
            return last_code, last_body
    return last_code, last_body


def main() -> int:
    url = load_webhook_url().strip()
    if not url:
        print("Missing GOOGLE_SHEETS_WEBHOOK_URL in backend/.env", file=sys.stderr)
        return 1

    payload = {
        "date": datetime.now(_RIYADH).strftime("%d/%m/%Y"),
        "orderid": "nidha-test-" + datetime.now().strftime("%H%M%S"),
        "country": "KSA",
        "name": "Test Sheet Row",
        "phone": "966500000001",
        "product": "اختبار الشيت",
        "sku": "nidha-K7XQ92",
        "quantity": "1",
        "totalprix": 199.0,
        "currency": "SAR",
        "status": "test",
    }
    code, text = post_apps_script_webhook(url, payload)
    print("HTTP", code)
    print(text[:500] if text else "(empty body)")
    print("Sent orderid:", payload["orderid"])
    if code >= 400:
        return 1
    if re.search(r'"status"\s*:\s*"error"', text):
        print("Apps Script returned status error", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
