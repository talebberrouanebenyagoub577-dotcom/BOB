"""Google Apps Script webhook delivery with exponential retries and full error logging."""
from __future__ import annotations

import asyncio
import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# Google Apps Script `/exec` runs doPost() on the initial POST, then responds with HTTP 302
# to a googleusercontent.com URL that only accepts GET.
_APPS_SCRIPT_REDIRECT_CODES = frozenset({301, 302, 303, 307, 308})

# Waits before each delivery attempt (attempt 1 is immediate).
RETRY_DELAYS_SEC = (0, 1, 3, 10)
MAX_RESPONSE_BODY_LOG = 4000
HTTP_TIMEOUT_SEC = 45.0


def _truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + f"... [truncated, total {len(text)} chars]"


def _summarize_response(r: httpx.Response) -> str:
    body = r.text or ""
    return f"HTTP {r.status_code} body={_truncate(body, 500)}"


def _log_http_failure(order_id: str, attempt: int, total: int, r: httpx.Response) -> None:
    body = r.text or ""
    if r.status_code >= 500:
        logger.error(
            "Sheets webhook HTTP %d for order %s (attempt %d/%d) — full response body:\n%s",
            r.status_code,
            order_id,
            attempt,
            total,
            _truncate(body, MAX_RESPONSE_BODY_LOG),
        )
    else:
        logger.warning(
            "Sheets webhook HTTP %d for order %s (attempt %d/%d) body: %s",
            r.status_code,
            order_id,
            attempt,
            total,
            _truncate(body, 800),
        )


async def _post_apps_script_webhook(
    client: httpx.AsyncClient, start_url: str, payload: dict
) -> httpx.Response:
    return await client.post(start_url.strip(), json=payload, follow_redirects=False)


async def _try_once(client: httpx.AsyncClient, url: str, payload: dict, *, attempt: int, total: int) -> tuple[bool, str | None, str | None]:
    """Single HTTP attempt. Returns (ok, error_summary, response_body_for_storage)."""
    order_id = str(payload.get("orderid") or "?")
    r = await _post_apps_script_webhook(client, url, payload)
    body = r.text or ""

    if r.status_code in _APPS_SCRIPT_REDIRECT_CODES:
        return True, None, body

    if r.status_code == 200:
        try:
            data = r.json()
            if isinstance(data, dict) and data.get("status") == "error":
                msg = str(data.get("message") or "Apps Script error")
                _log_http_failure(order_id, attempt, total, r)
                return False, msg, body
        except ValueError:
            logger.warning(
                "Sheets webhook 200 non-JSON for order %s (first 120 chars): %s",
                order_id,
                _truncate(body, 120),
            )
        return True, None, body

    _log_http_failure(order_id, attempt, total, r)
    return False, _summarize_response(r), body


async def deliver_sheet_row(payload: dict) -> tuple[bool, str | None, str | None]:
    """
    Deliver one sheet row with exponential backoff (0s, 1s, 3s, 10s between attempts).
    Returns (success, error_summary, last_response_body).
    """
    url = (settings.GOOGLE_SHEETS_WEBHOOK_URL or "").strip()
    order_id = str(payload.get("orderid") or "?")

    if not url:
        msg = "GOOGLE_SHEETS_WEBHOOK_URL is empty"
        logger.warning("%s — skipped order %s", msg, order_id)
        return False, msg, None

    last_err: str | None = None
    last_body: str | None = None
    total = len(RETRY_DELAYS_SEC)

    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT_SEC) as client:
        for idx, delay in enumerate(RETRY_DELAYS_SEC):
            attempt = idx + 1
            if delay > 0:
                logger.info(
                    "Sheets webhook retry for order %s in %ds (attempt %d/%d)",
                    order_id,
                    delay,
                    attempt,
                    total,
                )
                await asyncio.sleep(delay)

            try:
                ok, err, body = await _try_once(client, url, payload, attempt=attempt, total=total)
                last_body = body
                if ok:
                    logger.info(
                        "Sheets webhook delivered for order %s on attempt %d/%d",
                        order_id,
                        attempt,
                        total,
                    )
                    return True, None, body

                last_err = err

            except Exception as exc:
                last_err = f"{type(exc).__name__}: {exc}"
                logger.warning(
                    "Sheets webhook attempt %d/%d failed for order %s: %s",
                    attempt,
                    total,
                    order_id,
                    last_err,
                )

    logger.error(
        "Sheets webhook exhausted %d attempts for order %s — last error: %s",
        total,
        order_id,
        last_err,
    )
    return False, last_err, last_body


async def send_to_sheets(payload: dict) -> None:
    """Backward-compatible entry: enqueue + deliver (never raises)."""
    from app.services.sheet_sync import enqueue_sheet_sync

    await enqueue_sheet_sync(payload)
