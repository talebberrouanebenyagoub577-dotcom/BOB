from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import HTTPException

# Windows without IANA DB: pip install tzdata. Fallback = fixed UTC+3 (KSA has no DST).
try:
    RIYADH = ZoneInfo("Asia/Riyadh")
except ZoneInfoNotFoundError:
    RIYADH = timezone(timedelta(hours=3), name="Asia/Riyadh")
UTC = timezone.utc


def riyadh_day_range_utc(from_s: str, to_s: str) -> tuple[datetime, datetime]:
    """Inclusive calendar dates in Asia/Riyadh → [start_utc, end_exclusive_utc)."""
    try:
        d0 = date.fromisoformat(from_s)
        d1 = date.fromisoformat(to_s)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid date (use YYYY-MM-DD)") from e
    if d1 < d0:
        raise HTTPException(status_code=400, detail="to must be >= from")
    start_utc = datetime.combine(d0, time.min, tzinfo=RIYADH).astimezone(UTC)
    end_excl_utc = datetime.combine(d1 + timedelta(days=1), time.min, tzinfo=RIYADH).astimezone(
        UTC
    )
    return start_utc, end_excl_utc
