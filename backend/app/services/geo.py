"""
IP geolocation check using ip-api.com (free, no key needed).
Returns True if the IP is from Saudi Arabia (or is private/local).
"""
import logging

import httpx

logger = logging.getLogger(__name__)

_PRIVATE_PREFIXES = ("10.", "172.", "192.168.", "127.", "::1", "fc", "fd")


def _is_private(ip: str) -> bool:
    return any(ip.startswith(p) for p in _PRIVATE_PREFIXES)


async def is_saudi_ip(ip: str) -> bool:
    """Returns True if IP is from SA, or if we can't determine (fail open)."""
    if not ip or _is_private(ip):
        return True  # local/dev — allow
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            r = await client.get(f"http://ip-api.com/json/{ip}?fields=countryCode")
            if r.status_code == 200:
                data = r.json()
                country = data.get("countryCode", "")
                logger.info(f"IP {ip} → country: {country}")
                return country == "SA"
    except Exception as e:
        logger.warning(f"IP geo check failed for {ip}: {e}")
    return True  # fail open — don't block if API is down
