"""
Server-side CAPI for Meta, TikTok, Snapchat.
All PII is SHA-256 hashed before sending.
All three fire concurrently — never blocks the order response.
"""
import asyncio
import logging
import time
from typing import Any

import httpx

from app.config import settings
from app.services.hasher import normalize_phone_meta, normalize_phone_tiktok, sha256

logger = logging.getLogger(__name__)


async def _post(client: httpx.AsyncClient, url: str, payload: dict[str, Any], headers: dict[str, str]) -> None:
    try:
        r = await client.post(url, json=payload, headers=headers, timeout=8.0)
        r.raise_for_status()
    except Exception as exc:
        logger.warning("CAPI error [%s]: %s", url, exc)


async def fire_meta_capi(event_id: str, phone: str, name: str, value: float, skus: list[str]) -> None:
    if not settings.META_ACCESS_TOKEN or not settings.META_PIXEL_ID:
        return
    hashed_phone = sha256(normalize_phone_meta(phone))
    payload: dict[str, Any] = {
        "data": [
            {
                "event_name": "Purchase",
                "event_time": int(time.time()),
                "event_id": event_id,
                "action_source": "website",
                "user_data": {"ph": [hashed_phone]},
                "custom_data": {
                    "currency": "SAR",
                    "value": value,
                    "content_ids": skus,
                    "content_type": "product",
                },
            }
        ]
    }
    if settings.META_TEST_EVENT_CODE:
        payload["test_event_code"] = settings.META_TEST_EVENT_CODE

    url = f"https://graph.facebook.com/v19.0/{settings.META_PIXEL_ID}/events?access_token={settings.META_ACCESS_TOKEN}"
    async with httpx.AsyncClient() as client:
        await _post(client, url, payload, {})


async def fire_tiktok_capi(event_id: str, phone: str, name: str, value: float, skus: list[str]) -> None:
    if not settings.TIKTOK_ACCESS_TOKEN or not settings.TIKTOK_PIXEL_ID:
        return
    # TikTok phone MUST have + prefix
    hashed_phone = sha256(normalize_phone_tiktok(phone))
    payload = {
        "pixel_code": settings.TIKTOK_PIXEL_ID,
        "event": "CompletePayment",
        "event_id": event_id,
        "timestamp": str(int(time.time())),
        "context": {
            "user": {"phone_number": hashed_phone},
        },
        "properties": {
            "currency": "SAR",
            "value": value,
            "content_id": ",".join(skus),
            "content_type": "product",
        },
    }
    url = "https://business-api.tiktok.com/open_api/v1.3/pixel/track/"
    headers = {"Access-Token": settings.TIKTOK_ACCESS_TOKEN}
    async with httpx.AsyncClient() as client:
        await _post(client, url, payload, headers)


async def fire_snap_capi(event_id: str, phone: str, name: str, value: float, skus: list[str]) -> None:
    if not settings.SNAP_ACCESS_TOKEN or not settings.SNAP_PIXEL_ID:
        return
    hashed_phone = sha256(normalize_phone_meta(phone))
    payload = {
        "pixel_id": settings.SNAP_PIXEL_ID,
        "test_event_code": "",
        "data": [
            {
                "event_type": "PURCHASE",
                "event_time": int(time.time()),
                "event_source_url": "https://nidhamauto.shop",
                "user_data": {"ph": hashed_phone},
                "custom_data": {
                    "currency": "SAR",
                    "price": str(value),
                    "item_ids": skus,
                },
                "event_id": event_id,
            }
        ],
    }
    url = "https://tr.snapchat.com/v3/{}/events".format(settings.SNAP_PIXEL_ID)
    headers = {"Authorization": f"Bearer {settings.SNAP_ACCESS_TOKEN}"}
    async with httpx.AsyncClient() as client:
        await _post(client, url, payload, headers)


async def fire_all_capi(event_id: str, phone: str, name: str, value: float, skus: list[str]) -> None:
    """Fire all 3 CAPIs concurrently. Errors are swallowed — never block order."""
    await asyncio.gather(
        fire_meta_capi(event_id, phone, name, value, skus),
        fire_tiktok_capi(event_id, phone, name, value, skus),
        fire_snap_capi(event_id, phone, name, value, skus),
        return_exceptions=True,
    )
