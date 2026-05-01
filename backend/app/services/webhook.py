"""Google Sheets webhook — retries up to 2 times, never blocks order."""
import asyncio
import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


async def send_to_sheets(payload: dict) -> None:
    if not settings.GOOGLE_SHEET_WEBHOOK:
        return

    for attempt in range(3):
        try:
            async with httpx.AsyncClient() as client:
                r = await client.post(settings.GOOGLE_SHEET_WEBHOOK, json=payload, timeout=10.0)
                r.raise_for_status()
                return
        except Exception as exc:
            logger.warning("Webhook attempt %d failed: %s", attempt + 1, exc)
            if attempt < 2:
                await asyncio.sleep(0.4)
    logger.error("Webhook failed after 3 attempts for order %s", payload.get("order_number"))
