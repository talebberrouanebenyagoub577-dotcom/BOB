import re
from typing import Optional

from pydantic import BaseModel, field_validator

SAUDI_PHONE_RE = re.compile(r"^05\d{8}$")
SAUDI_PHONE_INTL_RE = re.compile(r"^\+?9665\d{8}$")


def normalize_saudi_phone(value: str) -> str:
    value = re.sub(r"[\s-]", "", value.strip())
    if SAUDI_PHONE_RE.match(value):
        return value
    if SAUDI_PHONE_INTL_RE.match(value):
        return "0" + value.replace("+", "")[3:]
    return value


class OrderItemIn(BaseModel):
    sku: str
    qty: int
    unit_price: float
    name_ar: str = ""


class OrderIn(BaseModel):
    name: str
    phone: str
    city: Optional[str] = None
    items: list[OrderItemIn]
    total: float
    upsell_accepted: bool = False
    upsell_sku: Optional[str] = None
    upsell_name_ar: Optional[str] = None
    event_id: str

    @field_validator("name")
    @classmethod
    def name_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("الاسم يجب أن يكون حرفين على الأقل")
        if v.isdigit():
            raise ValueError("الاسم لا يمكن أن يكون أرقاماً فقط")
        return v

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        v = normalize_saudi_phone(v)
        if not SAUDI_PHONE_RE.match(v):
            raise ValueError("رقم الجوال يجب أن يكون سعودياً مثل 05XXXXXXXX أو +9665XXXXXXXX")
        return v


class OrderOut(BaseModel):
    order_id: str
    order_number: str
