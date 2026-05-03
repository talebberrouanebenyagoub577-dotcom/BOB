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
    from sqlalchemy import text
    logger.info(f"Connecting to DB host: {settings.DATABASE_URL.split('@')[-1].split('/')[0]}")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            # Add new columns safely (no-op if already exists)
            await conn.execute(text(
                "ALTER TABLE orders ADD COLUMN IF NOT EXISTS city VARCHAR(100)"
            ))
        logger.info("Database tables ensured.")
    except Exception as e:
        logger.error(f"DB connection failed (will retry on first request): {e}")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/admin/diagnose")
async def diagnose() -> dict:
    import socket
    hosts = [
        "databes", "organisat_databes", "organisat-databes",
        "nidhamauto_database", "host.docker.internal", "172.17.0.1",
    ]
    results = {}
    for host in hosts:
        try:
            ip = socket.gethostbyname(host)
            results[host] = f"OK → {ip}"
        except Exception as e:
            results[host] = f"FAIL: {e}"
    return results


app.include_router(orders_router)
