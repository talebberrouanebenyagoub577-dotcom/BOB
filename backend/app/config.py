from pathlib import Path
from typing import Self

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_ENV = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    # Always backend/.env (not repo-root cwd) — avoids "Invalid credentials" when uvicorn cwd != backend/
    model_config = SettingsConfigDict(env_file=_BACKEND_ENV, env_file_encoding="utf-8", extra="ignore")

    # Full URL when POSTGRES_PASSWORD is empty (legacy / advanced).
    DATABASE_URL: str = "postgresql+asyncpg://nidhamauto:nidhamauto@db:5432/nidhamauto"

    # Preferred: set POSTGRES_PASSWORD raw in .env — proper URL encoding (@, :, etc.) applied automatically.
    POSTGRES_USER: str = "nidhamauto"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "nidhamauto"

    # Browser redirect for GET /admin — same as storefront public URL.
    FRONTEND_URL: str = "https://nidhamauto.shop"

    META_ACCESS_TOKEN: str = ""
    META_PIXEL_ID: str = ""
    META_TEST_EVENT_CODE: str = ""

    TIKTOK_ACCESS_TOKEN: str = ""
    TIKTOK_PIXEL_ID: str = ""

    SNAP_ACCESS_TOKEN: str = ""
    SNAP_PIXEL_ID: str = ""

    GOOGLE_SHEETS_WEBHOOK_URL: str = ""
    SECRET_KEY: str = "change-me"
    WHITELISTED_PHONES: str = "+966550603"

    # Admin dashboard (HTTP Basic-style login → JWT)
    ADMIN_USERNAME: str = ""
    ADMIN_PASSWORD: str = ""
    ADMIN_JWT_SECRET: str = ""

    # Traffic quality — MaxMind GeoIP2/Insights + IPQualityScore (optional second signal)
    MAXMIND_ACCOUNT_ID: str = ""
    MAXMIND_LICENSE_KEY: str = ""
    IPQUALITYSCORE_API_KEY: str = ""

    # Dev/staging ONLY: RFC1918 + loopback count as traffic_valid (localhost dashboards).
    # Must stay false in production.
    TRAFFIC_TRUST_PRIVATE_IP: bool = False

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_async_database_url(cls, v: object) -> object:
        """Railway/Heroku often use postgres:// — asyncpg needs postgresql+asyncpg://."""
        if not isinstance(v, str):
            return v
        s = v.strip()
        if not s:
            return v
        if s.startswith("postgres://"):
            return "postgresql+asyncpg://" + s[len("postgres://") :]
        if s.startswith("postgresql://") and not s.startswith("postgresql+"):
            return "postgresql+asyncpg://" + s[len("postgresql://") :]
        return s

    @model_validator(mode="after")
    def assemble_database_url_when_password_set(self) -> Self:
        raw = (self.POSTGRES_PASSWORD if isinstance(self.POSTGRES_PASSWORD, str) else "").strip()
        if raw != "":
            from urllib.parse import quote_plus

            u = quote_plus(self.POSTGRES_USER.strip())
            p = quote_plus(raw)
            h = self.POSTGRES_HOST.strip()
            db = self.POSTGRES_DB.strip()
            port = int(self.POSTGRES_PORT)
            assembled = f"postgresql+asyncpg://{u}:{p}@{h}:{port}/{db}"
            return self.model_copy(update={"DATABASE_URL": assembled})
        return self

    @field_validator("TRAFFIC_TRUST_PRIVATE_IP", mode="before")
    @classmethod
    def coerce_traffic_trust_private_ip(cls, v: object) -> object:
        if isinstance(v, str):
            s = v.strip().lower()
            if s in ("true", "1", "yes", "on", "trues"):  # "trues" was a common .env typo
                return True
            if s in ("false", "0", "no", "off", ""):
                return False
            return False
        return v

    @field_validator("GOOGLE_SHEETS_WEBHOOK_URL", mode="before")
    @classmethod
    def sheets_webhook_https(cls, v: object) -> object:
        if not isinstance(v, str):
            return v
        s = v.strip()
        if not s:
            return ""
        if s.startswith("//"):
            s = "https:" + s
        return s


settings = Settings()
