from typing import Any

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.http_client_ip import client_ip_from_request
from app.models.tracking import TrackingEvent
from app.services.traffic_intel import classify_visitor_ip

router = APIRouter(prefix="/api", tags=["analytics"])

_ALLOWED = frozenset(
    {"page_view", "view_content", "add_to_cart", "initiate_checkout", "cta_click"}
)


class TrackBody(BaseModel):
    event_type: str
    session_id: str = Field(min_length=8, max_length=64)
    path: str = ""
    meta: dict[str, Any] = Field(default_factory=dict)

    @field_validator("event_type")
    @classmethod
    def event_ok(cls, v: str) -> str:
        if v not in _ALLOWED:
            raise ValueError("unsupported event_type")
        return v


@router.post("/track")
async def storefront_track(
    request: Request,
    body: TrackBody,
    db: AsyncSession = Depends(get_db),
) -> dict[str, bool]:
    ip = client_ip_from_request(request)
    verdict = await classify_visitor_ip(ip)

    ev = TrackingEvent(
        session_id=body.session_id[:64],
        event_type=body.event_type,
        path=(body.path or "")[:512] or None,
        meta=body.meta or {},
        client_ip=ip[:45] if ip else None,
        traffic_valid=verdict.is_valid_ksa,
    )
    db.add(ev)
    await db.commit()
    return {"ok": True}
