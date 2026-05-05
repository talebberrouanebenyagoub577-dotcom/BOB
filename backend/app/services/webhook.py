"""Google Sheets webhook — retries up to 2 times, never blocks order."""
import asyncio
import logging
from urllib.parse import urljoin

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# Google Apps Script `/exec` almost always responds with HTTP 302 to script.googleusercontent.com.
# Many HTTP clients (including httpx with follow_redirects=True) replay that redirect as GET,
# which runs doGet() only — no row is appended. Follow redirects manually while keeping POST + JSON.
_MAX_REDIRECT_HOPS = 8


async def _post_apps_script_webhook(
    client: httpx.AsyncClient, start_url: str, payload: dict
) -> httpx.Response:
    current = start_url.strip()
    response: httpx.Response | None = None
    for _ in range(_MAX_REDIRECT_HOPS):
        response = await client.post(current, json=payload, follow_redirects=False)
        if response.status_code in (301, 302, 307, 308):
            loc = response.headers.get("location")
            if not loc:
                break
            current = loc if loc.startswith("http") else urljoin(str(response.url), loc)
            continue
        break
    assert response is not None
    return response


async def send_to_sheets(payload: dict) -> None:
    url = (settings.GOOGLE_SHEETS_WEBHOOK_URL or "").strip()
    if not url:
        logger.warning(
            "GOOGLE_SHEETS_WEBHOOK_URL is empty — Sheets webhook skipped for order %s",
            payload.get("orderid"),
        )
        return

    for attempt in range(3):
        try:
            async with httpx.AsyncClient() as client:
                r = await _post_apps_script_webhook(client, url, payload)
                r.raise_for_status()
                try:
                    data = r.json()
                    if isinstance(data, dict) and data.get("status") == "error":
                        raise RuntimeError(data.get("message", "Apps Script error"))
                except ValueError:
                    logger.warning(
                        "Sheets webhook returned non-JSON (first 120 chars): %s",
                        r.text[:120],
                    )
                return
        except Exception as exc:
            logger.warning("Webhook attempt %d failed: %s", attempt + 1, exc)
            if attempt < 2:
                await asyncio.sleep(0.4)
    logger.error(
        "Webhook failed after 3 attempts for order %s",
        payload.get("orderid"),
    )
