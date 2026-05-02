import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.orders import router as orders_router
from app.database import Base, engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Nidha Mauto API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://nidhamauto.shop"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    """Auto-run migrations on startup."""
    from app.config import settings
    logger.info(f"Connecting to DB host: {settings.DATABASE_URL.split('@')[-1].split('/')[0]}")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables ensured.")
    except Exception as e:
        logger.error(f"STARTUP ERROR — DB connection failed: {e}")
        raise


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


app.include_router(orders_router)
