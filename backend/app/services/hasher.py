import hashlib


def sha256(value: str) -> str:
    """SHA-256 hash a string (lowercase + stripped). Required for CAPI PII."""
    return hashlib.sha256(value.strip().lower().encode()).hexdigest()


def normalize_phone_meta(phone: str) -> str:
    """05XXXXXXXX → 966XXXXXXXX (Meta/Snap format, no +)"""
    return "966" + phone[1:]


def normalize_phone_tiktok(phone: str) -> str:
    """05XXXXXXXX → +966XXXXXXXX (TikTok MUST have + prefix)"""
    return "+966" + phone[1:]
