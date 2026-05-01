import random
import string
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.order import Order, OrderItem
from app.schemas.order import OrderIn, OrderOut
from app.services.tracking import fire_all_capi
from app.services.webhook import send_to_sheets

router = APIRouter()


def _generate_order_number() -> str:
    suffix = "".join(random.choices(string.digits, k=6))
    return f"NM-{suffix}"


@router.post("/order", response_model=OrderOut)
async def create_order(
    body: OrderIn,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> OrderOut:
    order_number = _generate_order_number()

    order = Order(
        order_number=order_number,
        name=body.name,
        phone=body.phone,
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
