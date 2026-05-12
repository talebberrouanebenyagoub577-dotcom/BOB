"""
Visitor quality: KSA + not VPN/proxy/datacenter using MaxMind GeoIP2 Web Services
(country/insights) plus optional IPQualityScore.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import httpx

from app.config import settings
from app.services.geo import is_saudi_ip

logger = logging.getLogger(__name__)

_PRIVATE_PREFIXES = ("10.", "172.", "192.168.", "127.", "::1", "fc", "fd")


def _is_private(ip: str) -> bool:
    if not ip:
        return True
    ip = ip.strip()
    return any(ip.startswith(p) for p in _PRIVATE_PREFIXES)


@dataclass(frozen=True)
class VisitorVerdict:
    is_valid_ksa: bool
    iso_country: str
    maxmind_anonymous_signal: bool
    ipqs_bad_network: bool


def vpn_filtering_active() -> bool:
    return bool(settings.MAXMIND_ACCOUNT_ID.strip() and settings.MAXMIND_LICENSE_KEY.strip())


def ipqs_active() -> bool:
    return bool(settings.IPQUALITYSCORE_API_KEY.strip())


async def _maxmind_lookup(ip: str) -> tuple[str, bool, bool]:
    """
    Returns (iso_country, has_mm_credentials_lookup_ok, anonymous_or_dc_signal).
    If credentials missing or request fails: ("", False, False).
    anonymous_or_dc_signal True => should NOT count as clean traffic when MM filter is active.
    """
    acc = settings.MAXMIND_ACCOUNT_ID.strip()
    key = settings.MAXMIND_LICENSE_KEY.strip()
    if not acc or not key:
        return "", False, False

    anon = False
    iso = ""
    for svc in ("insights", "city", "country"):
        url = f"https://geoip.maxmind.com/geoip/v2.1/{svc}/{ip}"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                r = await client.get(url, auth=(acc, key))
                if r.status_code == 403 or r.status_code == 404:
                    continue
                r.raise_for_status()
                data = r.json()
        except Exception as exc:
            logger.warning("MaxMind %s lookup failed for %s: %s", svc, ip, exc)
            continue

        country = data.get("country") or {}
        iso = str(country.get("iso_code") or "").upper()
        traits = data.get("traits") or {}

        anon = False
        for k in (
            "is_anonymous",
            "is_anonymous_proxy",
            "is_anonymous_vpn",
            "is_hosting_provider",
            "is_public_proxy",
            "is_tor_exit_node",
        ):
            if traits.get(k):
                anon = True
                break

        logger.debug("MaxMind %s ip=%s country=%s anon_signal=%s", svc, ip, iso, anon)
        return iso, True, anon

    return "", False, False


async def _ipqs_lookup(ip: str) -> tuple[str, bool]:
    """Returns (country_code uppercase, bad_network composite)."""
    api_key = settings.IPQUALITYSCORE_API_KEY.strip()
    if not api_key:
        return "", False

    url = f"https://ipqualityscore.com/api/json/ip/{api_key}/{ip}?strictness=1&fast=true"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(url)
            r.raise_for_status()
            data = r.json()
    except Exception as exc:
        logger.warning("IPQualityScore lookup failed for %s: %s", ip, exc)
        return "", False

    if not data.get("success"):
        return "", False

    cc_raw = str(data.get("country_code") or "").strip().upper()
    cc = cc_raw[:2] if len(cc_raw) >= 2 else cc_raw

    fraud = float(data.get("fraud_score") or 0)
    bad = any(
        [
            bool(data.get("vpn")),
            bool(data.get("proxy")),
            bool(data.get("TOR")),
            bool(data.get("tor")),
            bool(data.get("hosting")),  # datacenter-ish
            bool(data.get("active_vpn")),
            bool(data.get("active_tor")),
            fraud >= 85,
        ]
    )
    return cc, bad


def trust_private_ip_for_metrics() -> bool:
    return bool(settings.TRAFFIC_TRUST_PRIVATE_IP)


async def classify_visitor_ip(ip: str) -> VisitorVerdict:
    """
    traffic_valid semantics:
      - Must look like Saudi Arabia for public IPs.
      - When MaxMind credentials are set: also reject anonymous / proxy / VPN / hosting signals from MM.
      - When IPQS key is set: also reject vpn/proxy/tor/hosting (and extreme fraud_score).
      - Private IPs are excluded unless TRAFFIC_TRUST_PRIVATE_IP=true (local dev only).
    """
    if _is_private(ip):
        if trust_private_ip_for_metrics():
            return VisitorVerdict(
                is_valid_ksa=True,
                iso_country="LOCAL",
                maxmind_anonymous_signal=False,
                ipqs_bad_network=False,
            )
        return VisitorVerdict(
            is_valid_ksa=False,
            iso_country="",
            maxmind_anonymous_signal=False,
            ipqs_bad_network=False,
        )

    mm_country, mm_hit, mm_anon = await _maxmind_lookup(ip.strip())
    ipqs_country, ipqs_bad = await _ipqs_lookup(ip.strip())

    if vpn_filtering_active():
        if mm_hit and mm_country:
            is_ksa = mm_country == "SA"
        elif mm_hit and not mm_country:
            is_ksa = False
        else:
            is_ksa = await is_saudi_ip(ip.strip())
    else:
        is_ksa = await is_saudi_ip(ip.strip())

    if ipqs_active() and ipqs_country:
        is_ksa = is_ksa and ipqs_country == "SA"

    bad_network = False
    if vpn_filtering_active():
        bad_network = bad_network or mm_anon
    if ipqs_active():
        bad_network = bad_network or ipqs_bad

    ok = bool(is_ksa and not bad_network)
    iso_guess = mm_country or ipqs_country or ("SA" if is_ksa else "")

    return VisitorVerdict(
        is_valid_ksa=ok,
        iso_country=iso_guess,
        maxmind_anonymous_signal=bool(vpn_filtering_active() and mm_anon),
        ipqs_bad_network=ipqs_bad,
    )
