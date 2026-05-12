from collections import defaultdict
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.deps.admin_auth import LoginBody, create_admin_token, verify_admin
from app.models.order import Order
from app.models.tracking import TrackingEvent
from app.services.traffic_intel import ipqs_active, trust_private_ip_for_metrics, vpn_filtering_active

from app.date_range import riyadh_day_range_utc

router = APIRouter(tags=["admin"])


@router.post("/admin/auth/login")
async def admin_login(body: LoginBody) -> dict[str, str]:
    u = settings.ADMIN_USERNAME.strip()
    p = settings.ADMIN_PASSWORD.strip()
    if not u or not p:
        raise HTTPException(status_code=503, detail="Admin credentials not configured")
    if body.username != u or body.password != p:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    try:
        token = create_admin_token()
    except HTTPException:
        raise HTTPException(
            status_code=503,
            detail="Set ADMIN_JWT_SECRET (or a strong SECRET_KEY) for admin tokens",
        ) from None
    return {"access_token": token, "token_type": "bearer"}


@router.get("/admin/metrics")
async def admin_metrics(
    _: None = Depends(verify_admin),
    db: AsyncSession = Depends(get_db),
    from_date: str = Query(..., alias="from"),
    to_date: str = Query(..., alias="to"),
) -> dict[str, Any]:
    start_utc, end_excl_utc = riyadh_day_range_utc(from_date, to_date)

    vf = TrackingEvent.traffic_valid.is_(True)
    ts = TrackingEvent.created_at >= start_utc
    te = TrackingEvent.created_at < end_excl_utc

    q_sessions = (
        select(func.count(func.distinct(TrackingEvent.session_id)))
        .where(vf, ts, te)
    )
    res_s = await db.execute(q_sessions)
    unique_sessions_valid = int(res_s.scalar_one() or 0)

    async def count_event(et: str) -> int:
        r = await db.execute(
            select(func.count())
            .select_from(TrackingEvent)
            .where(vf, ts, te, TrackingEvent.event_type == et)
        )
        return int(r.scalar_one() or 0)

    page_views_valid = await count_event("page_view")
    view_content_valid = await count_event("view_content")
    add_to_cart_valid = await count_event("add_to_cart")
    initiate_checkout_valid = await count_event("initiate_checkout")
    cta_clicks_valid = await count_event("cta_click")

    of = Order.traffic_valid.is_(True)
    os_ = Order.created_at >= start_utc
    oe = Order.created_at < end_excl_utc

    ro = await db.execute(select(func.count()).select_from(Order).where(of, os_, oe))
    orders_valid = int(ro.scalar_one() or 0)

    rsum = await db.execute(select(func.coalesce(func.sum(Order.total), 0.0)).where(of, os_, oe))
    revenue_valid = float(rsum.scalar_one() or 0.0)

    rup = await db.execute(
        select(func.count()).select_from(Order).where(of, os_, oe, Order.upsell_accepted.is_(True))
    )
    upsell_orders_valid = int(rup.scalar_one() or 0)

    conversion_rate = (orders_valid / unique_sessions_valid) if unique_sessions_valid else 0.0
    aov_valid = (revenue_valid / orders_valid) if orders_valid else 0.0
    upsell_rate_valid = (upsell_orders_valid / orders_valid) if orders_valid else 0.0

    server_clicks_valid = page_views_valid + cta_clicks_valid

    # --- daily merge (Riyadh calendar day)
    day_key = "d"
    bind = {"s": start_utc, "e": end_excl_utc}

    daily_orders = await db.execute(
        text(
            f"""
            SELECT to_char((created_at AT TIME ZONE 'Asia/Riyadh')::date, 'YYYY-MM-DD') AS {day_key},
                   COUNT(*)::int AS orders,
                   COALESCE(SUM(total), 0)::float AS revenue
            FROM orders
            WHERE traffic_valid IS TRUE
              AND created_at >= :s AND created_at < :e
            GROUP BY 1
            ORDER BY 1
            """
        ),
        bind,
    )

    daily_sess = await db.execute(
        text(
            f"""
            SELECT to_char((created_at AT TIME ZONE 'Asia/Riyadh')::date, 'YYYY-MM-DD') AS {day_key},
                   COUNT(DISTINCT session_id)::int AS sessions
            FROM tracking_events
            WHERE traffic_valid IS TRUE
              AND created_at >= :s AND created_at < :e
            GROUP BY 1
            ORDER BY 1
            """
        ),
        bind,
    )

    daily_pvs = await db.execute(
        text(
            f"""
            SELECT to_char((created_at AT TIME ZONE 'Asia/Riyadh')::date, 'YYYY-MM-DD') AS {day_key},
                   COUNT(*)::int AS page_views
            FROM tracking_events
            WHERE traffic_valid IS TRUE
              AND event_type = 'page_view'
              AND created_at >= :s AND created_at < :e
            GROUP BY 1
            ORDER BY 1
            """
        ),
        bind,
    )

    merged: dict[str, dict[str, float | int]] = defaultdict(
        lambda: {"sessions": 0, "page_views": 0, "orders": 0, "revenue": 0.0}
    )
    for row in daily_sess.mappings():
        merged[row[day_key]]["sessions"] = int(row["sessions"])
    for row in daily_pvs.mappings():
        merged[row[day_key]]["page_views"] = int(row["page_views"])
    for row in daily_orders.mappings():
        merged[row[day_key]]["orders"] = int(row["orders"])
        merged[row[day_key]]["revenue"] = float(row["revenue"])

    daily_list = [
        {
            "date": k,
            "sessions": int(v["sessions"]),
            "page_views": int(v["page_views"]),
            "orders": int(v["orders"]),
            "revenue": float(v["revenue"]),
        }
        for k, v in sorted(merged.items(), key=lambda x: x[0])
    ]

    return {
        "from_date": from_date,
        "to_date": to_date,
        "vpn_filtering_active": vpn_filtering_active(),
        "ipqs_active": ipqs_active(),
        "traffic_trust_private_ip": trust_private_ip_for_metrics(),
        "unique_sessions_valid": unique_sessions_valid,
        "server_clicks_valid": server_clicks_valid,
        "page_views_valid": page_views_valid,
        "view_content_valid": view_content_valid,
        "add_to_cart_valid": add_to_cart_valid,
        "initiate_checkout_valid": initiate_checkout_valid,
        "cta_clicks_valid": cta_clicks_valid,
        "orders_valid": orders_valid,
        "revenue_valid": revenue_valid,
        "conversion_rate": conversion_rate,
        "aov_valid": aov_valid,
        "upsell_orders_valid": upsell_orders_valid,
        "upsell_rate_valid": upsell_rate_valid,
        "daily": daily_list,
    }
