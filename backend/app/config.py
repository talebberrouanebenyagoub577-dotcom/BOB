from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://nidhamauto:auto.shop%20@organisat_databes:5432/nidhamauto"

    META_ACCESS_TOKEN: str = ""
    META_PIXEL_ID: str = ""
    META_TEST_EVENT_CODE: str = ""

    TIKTOK_ACCESS_TOKEN: str = ""
    TIKTOK_PIXEL_ID: str = ""

    SNAP_ACCESS_TOKEN: str = ""
    SNAP_PIXEL_ID: str = ""

    GOOGLE_SHEET_WEBHOOK: str = ""
    SECRET_KEY: str = "change-me"
    WHITELISTED_PHONES: str = "0779185640,+966550603022"


settings = Settings()
