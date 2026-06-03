"""Google Sheets webhook — retries up to 2 times, never blocks order."""
import asyncio
import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# Google Apps Script `/exec` runs doPost() on the initial POST, then responds with HTTP 302
# to a googleusercontent.com URL that only accepts GET. Following the redirect with POST
# yields 405; following with GET runs doGet() instead — neither appends a row.
_APPS_SCRIPT_REDIRECT_CODES = frozenset({301, 302, 303, 307, 308})


async def _post_apps_script_webhook(
    client: httpx.AsyncClient, start_url: str, payload: dict
) -> httpx.Response:
    return await client.post(start_url.strip(), json=payload, follow_redirects=False)


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
                if r.status_code in _APPS_SCRIPT_REDIRECT_CODES:
                    logger.info(
                        "Sheets webhook accepted (Apps Script %d after doPost) for order %s",
                        r.status_code,
                        payload.get("orderid"),
                    )
                    return
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
