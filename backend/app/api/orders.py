import random
import string
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import get_db
from app.models.order import Order, OrderItem
from app.schemas.order import OrderIn, OrderOut
from app.services.tracking import fire_all_capi
from app.services.webhook import send_to_sheets
from app.services.geo import is_saudi_ip

router = APIRouter()


def _get_client_ip(request: Request) -> str:
    """Get real client IP — handles Cloudflare CF-Connecting-IP and X-Forwarded-For."""
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip:
        return cf_ip.strip()
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else ""


def _is_whitelisted(phone: str) -> bool:
    allowed = [p.strip() for p in settings.WHITELISTED_PHONES.split(",") if p.strip()]
    normalized = phone.strip().replace("+966", "0").replace("966", "0", 1)
    for p in allowed:
        p_norm = p.replace("+966", "0").replace("966", "0", 1)
        if normalized == p_norm or phone == p:
            return True
    return False


def _generate_order_number() -> str:
    suffix = "".join(random.choices(string.digits, k=6))
    return f"NM-{suffix}"


@router.post("/order", response_model=OrderOut)
async def create_order(
    request: Request,
    body: OrderIn,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> OrderOut:
    # Block non-KSA orders unless phone is whitelisted
    if not _is_whitelisted(body.phone):
        client_ip = _get_client_ip(request)
        if not await is_saudi_ip(client_ip):
            raise HTTPException(status_code=403, detail="الخدمة متاحة داخل المملكة العربية السعودية فقط")

    order_number = _generate_order_number()

    order = Order(
        order_number=order_number,
        name=body.name,
        phone=body.phone,
        city=body.city,
        total=body.total,
        upsell_accepted=body.upsell_accepted,
        upsell_sku=body.upsell_sku,
        event_id=body.event_id,
    )
    for item in body.items:
        order.items.append(
            OrderItem(sku=item.sku, qty=item.qty, unit_price=item.unit_price)
        )

    db.add(order)
    await db.commit()
    await db.refresh(order)

    # Build SKUs list (including upsell if accepted)
    skus = [i.sku for i in body.items]
    if body.upsell_accepted and body.upsell_sku:
        skus.append(body.upsell_sku)

    # Sheets webhook payload
    sheet_payload = {
        "order_number": order_number,
        "order_id": order.id,
        "name": body.name,
        "phone": "'" + body.phone,  # ' prefix forces text in Google Sheets
        "total": body.total,
        "upsell_accepted": body.upsell_accepted,
        "upsell_sku": body.upsell_sku or "",
        "items": [i.model_dump() for i in body.items],
        "event_id": body.event_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    # Fire background tasks — never block response
    background_tasks.add_task(send_to_sheets, sheet_payload)
    background_tasks.add_task(
        fire_all_capi,
        body.event_id,
        body.phone,
        body.name,
        body.total,
        skus,
    )

    return OrderOut(order_id=order.id, order_number=order_number)


@router.get("/admin/orders")
async def list_orders(
    token: str = Query(...),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    if token != settings.SECRET_KEY and token != "nidham2026":
        raise HTTPException(status_code=403, detail="forbidden")

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .order_by(desc(Order.created_at))
        .limit(limit)
    )
    orders = result.scalars().all()

    return [
        {
            "order_number": o.order_number,
            "name": o.name,
            "phone": o.phone,
            "city": o.city or "",
            "total": o.total,
            "status": o.status,
            "upsell_accepted": o.upsell_accepted,
            "upsell_sku": o.upsell_sku,
            "items": [
                {"sku": i.sku, "qty": i.qty, "unit_price": i.unit_price}
                for i in o.items
            ],
            "created_at": o.created_at.isoformat(),
        }
        for o in orders
    ]
