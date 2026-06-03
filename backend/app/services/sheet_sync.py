"""Durable Google Sheets outbox — orders are never lost if Apps Script is temporarily down."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update

from app.database import AsyncSessionLocal
from app.models.sheet_sync import SheetSyncQueue
from app.services.webhook import RETRY_DELAYS_SEC, deliver_sheet_row

logger = logging.getLogger(__name__)

# Backoff before re-queuing after an inline delivery burst fails (seconds).
QUEUE_RETRY_BACKOFF = (60, 180, 600, 1800, 3600)
WORKER_INTERVAL_SEC = 30
WORKER_BATCH_SIZE = 25


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _queue_retry_delay(total_attempts: int) -> int:
    idx = min(max(total_attempts - len(RETRY_DELAYS_SEC), 0), len(QUEUE_RETRY_BACKOFF) - 1)
    return QUEUE_RETRY_BACKOFF[idx]


async def _ensure_queue_row(order_id: str, payload: dict) -> SheetSyncQueue | None:
    async with AsyncSessionLocal() as db:
        row = await db.scalar(select(SheetSyncQueue).where(SheetSyncQueue.order_id == order_id))
        if row and row.status == "sent":
            logger.info("Sheet sync already sent for order %s — skipping", order_id)
            return None
        if row is None:
            row = SheetSyncQueue(order_id=order_id, payload=payload, status="pending")
            db.add(row)
        else:
            row.payload = payload
        await db.commit()
        await db.refresh(row)
        return row


async def _claim_for_delivery(order_id: str) -> SheetSyncQueue | None:
    """Atomically claim a pending row so enqueue and the worker never deliver twice."""
    async with AsyncSessionLocal() as db:
        row = await db.scalar(
            select(SheetSyncQueue)
            .where(
                SheetSyncQueue.order_id == order_id,
                SheetSyncQueue.status == "pending",
            )
            .with_for_update(skip_locked=True)
        )
        if row is None:
            return None
        row.status = "processing"
        await db.commit()
        await db.refresh(row)
        return row


async def _mark_sent(order_id: str) -> None:
    async with AsyncSessionLocal() as db:
        await db.execute(
            update(SheetSyncQueue)
            .where(SheetSyncQueue.order_id == order_id)
            .values(status="sent", sent_at=_now(), last_error=None, last_response_body=None)
        )
        await db.commit()


async def _record_failure(
    order_id: str,
    error: str | None,
    response_body: str | None,
    attempts_added: int,
) -> None:
    async with AsyncSessionLocal() as db:
        row = await db.scalar(select(SheetSyncQueue).where(SheetSyncQueue.order_id == order_id))
        if row is None:
            return
        new_attempts = row.attempts + attempts_added
        delay = _queue_retry_delay(new_attempts)
        row.status = "pending"
        row.attempts = new_attempts
        row.last_error = error
        row.last_response_body = (response_body or "")[:8000] or None
        row.next_retry_at = _now() + timedelta(seconds=delay)
        await db.commit()
        logger.warning(
            "Sheet sync queued for retry: order=%s attempts=%d next_in=%ds error=%s",
            order_id,
            new_attempts,
            delay,
            error,
        )


async def enqueue_sheet_sync(payload: dict) -> None:
    """Persist payload first, then deliver with inline retries; schedule background retry on failure."""
    order_id = str(payload.get("orderid") or "").strip()
    if not order_id:
        logger.error("Sheet sync rejected: missing orderid in payload")
        return

    row = await _ensure_queue_row(order_id, payload)
    if row is None:
        return

    claimed = await _claim_for_delivery(order_id)
    if claimed is None:
        logger.info("Sheet sync delivery already in progress for order %s", order_id)
        return

    ok, err, body = await deliver_sheet_row(payload)
    if ok:
        await _mark_sent(order_id)
        return

    await _record_failure(order_id, err, body, attempts_added=len(RETRY_DELAYS_SEC))


async def drain_pending_sheet_sync(limit: int = WORKER_BATCH_SIZE) -> int:
    """Process due queue rows. Returns count processed."""
    now = _now()
    async with AsyncSessionLocal() as db:
        rows = (
            await db.scalars(
                select(SheetSyncQueue)
                .where(
                    SheetSyncQueue.status == "pending",
                    SheetSyncQueue.next_retry_at <= now,
                )
                .order_by(SheetSyncQueue.next_retry_at)
                .limit(limit)
                .with_for_update(skip_locked=True)
            )
        ).all()
        for row in rows:
            row.status = "processing"
        await db.commit()
        # Detach payloads before session closes
        work = [(r.order_id, dict(r.payload)) for r in rows]

    if not work:
        return 0

    logger.info("Sheet sync worker processing %d pending row(s)", len(work))
    processed = 0
    for order_id, payload in work:
        ok, err, body = await deliver_sheet_row(payload)
        if ok:
            await _mark_sent(order_id)
        else:
            await _record_failure(order_id, err, body, attempts_added=len(RETRY_DELAYS_SEC))
        processed += 1
    return processed


async def sheet_sync_worker(stop: asyncio.Event) -> None:
    """Background loop — retries pending sheet rows until Apps Script accepts them."""
    logger.info("Sheet sync worker started (interval=%ds)", WORKER_INTERVAL_SEC)
    while not stop.is_set():
        try:
            n = await drain_pending_sheet_sync()
            if n:
                logger.info("Sheet sync worker delivered/retried %d row(s)", n)
        except Exception:
            logger.exception("Sheet sync worker error")
        try:
            await asyncio.wait_for(stop.wait(), timeout=WORKER_INTERVAL_SEC)
        except asyncio.TimeoutError:
            pass
    logger.info("Sheet sync worker stopped")


async def startup_sheet_sync() -> None:
    """Flush backlog on boot, then start periodic worker."""
    n = await drain_pending_sheet_sync(limit=100)
    if n:
        logger.info("Sheet sync startup flush processed %d pending row(s)", n)
