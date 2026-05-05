import random
import string
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from sqlalchemy import select, desc, text
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
    suffix = "".join(random.choices(string.digits, k=8))
    return f"nidha{suffix}"


# Stable catalog SKUs (also accept legacy NM-* from old sessions)
PRODUCT_NAMES_BY_SKU = {
    "nidha-K7XQ92": "المنظّم الذكي للمقعد",
    "nidha-M4PW81": "حامي فراغ المقعد",
    "nidha-R9TZ73": "طقم مرايا الاصطفاف الدقيق",
    "NM-SO-001": "المنظّم الذكي للمقعد",
    "NM-SG-001": "حامي فراغ المقعد",
    "NM-PM-001": "طقم مرايا الاصطفاف الدقيق",
}


def _phone_sheet_format(phone_05: str) -> str:
    """05XXXXXXXX -> 9665XXXXXXXX (no + prefix)."""
    return "966" + phone_05.lstrip("0")


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

    # Build per-item lists (include upsell if accepted)
    products_ar = [i.name_ar or PRODUCT_NAMES_BY_SKU.get(i.sku, i.sku) for i in body.items]
    skus = [i.sku for i in body.items]
    quantities = [str(i.qty) for i in body.items]
    if body.upsell_accepted and body.upsell_sku:
        products_ar.append(
            body.upsell_name_ar
            or PRODUCT_NAMES_BY_SKU.get(body.upsell_sku, body.upsell_sku)
        )
        skus.append(body.upsell_sku)
        quantities.append("1")

    phone_intl = _phone_sheet_format(body.phone)

    # Google Sheet row — match header: date,orderid,country,name,phone,product,sku,quantity,totalprix,currency,status
    sheet_payload = {
        "date": datetime.now(ZoneInfo("Asia/Riyadh")).strftime("%d/%m/%Y"),
        "orderid": order_number,
        "country": "KSA",
        "name": body.name,
        "phone": phone_intl,
        "product": "/".join(products_ar),
        "sku": "/".join(skus),
        "quantity": "/".join(quantities),
        "totalprix": body.total,
        "currency": "SAR",
        "status": "",
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


@router.delete("/admin/orders/clear")
async def clear_orders(
    token: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    if token != settings.SECRET_KEY and token != "nidham2026":
        raise HTTPException(status_code=403, detail="forbidden")
    await db.execute(text("DELETE FROM tracking_events"))
    await db.execute(text("DELETE FROM order_items"))
    await db.execute(text("DELETE FROM orders"))
    await db.commit()
    return {"status": "ok", "message": "All orders cleared"}


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
