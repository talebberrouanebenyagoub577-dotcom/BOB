import asyncio
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, RedirectResponse

from app.config import settings
from app.api.admin_metrics import router as admin_metrics_router
from app.api.orders import router as orders_router
from app.api.tracking import router as tracking_router
from app.database import Base, engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Nidha Mauto API", version="1.0.0")

_sheet_sync_stop = asyncio.Event()
_sheet_sync_task: asyncio.Task | None = None

_cors_origins = ["https://nidhamauto.shop", "http://localhost:3000", "http://localhost:5173"]
_fu = settings.FRONTEND_URL.rstrip("/") if settings.FRONTEND_URL else ""
if _fu and _fu not in _cors_origins:
    _cors_origins.append(_fu)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    """Auto-run migrations on startup."""
    global _sheet_sync_task
    from sqlalchemy import text

    from app.models.sheet_sync import SheetSyncQueue  # noqa: F401
    from app.models.tracking import TrackingEvent  # noqa: F401
    from app.services.sheet_sync import sheet_sync_worker, startup_sheet_sync

    has_piecemeal_pw = bool((settings.POSTGRES_PASSWORD or "").strip())
    if has_piecemeal_pw:
        logger.info(
            "Connecting to DB host=%s port=%s db=%s",
            settings.POSTGRES_HOST,
            settings.POSTGRES_PORT,
            settings.POSTGRES_DB,
        )
    else:
        tail = ""
        try:
            rest = settings.DATABASE_URL.split("://", 1)[1]
            after_cred = rest.split("@", 1)[1]
            tail = after_cred.split("/")[0]
        except Exception:
            tail = "(?)"
        logger.info("Connecting to DB (from DATABASE_URL): %s", tail)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await conn.execute(
                text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS city VARCHAR(100)")
            )
            await conn.execute(
                text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS client_ip VARCHAR(45)")
            )
            await conn.execute(
                text(
                    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS traffic_valid BOOLEAN"
                )
            )
            await conn.execute(
                text(
                    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS session_id VARCHAR(64)"
                )
            )
        logger.info("Database tables ensured.")
    except Exception as e:
        err_l = str(e).lower()
        hint = ""
        if "password authentication failed" in err_l:
            hint = " (hint: POSTGRES_PASSWORD / DATABASE_URL must match the DB user password)"
        elif "could not translate host name" in err_l or "name or service not known" in err_l:
            hint = " (hint: check POSTGRES_HOST / network DNS)"
        logger.error("DB connection failed (will retry on first request): %s%s", e, hint)

    # Helps verify deploy: if this list omits GET /admin, the running image is stale or wrong module.
    try:
        admin_paths = []
        for r in app.routes:
            p = getattr(r, "path", None)
            if not p or "admin" not in str(p):
                continue
            m = getattr(r, "methods", None) or frozenset()
            admin_paths.append((sorted(m) if isinstance(m, (set, frozenset)) else m, str(p)))
        logger.info("Admin-related routes registered: %s", admin_paths)
    except Exception as e:
        logger.warning("Could not introspect routes: %s", e)

    try:
        await startup_sheet_sync()
        _sheet_sync_stop.clear()
        _sheet_sync_task = asyncio.create_task(sheet_sync_worker(_sheet_sync_stop))
    except Exception as e:
        logger.error("Sheet sync worker failed to start: %s", e)


@app.on_event("shutdown")
async def shutdown() -> None:
    global _sheet_sync_task
    _sheet_sync_stop.set()
    if _sheet_sync_task is not None:
        _sheet_sync_task.cancel()
        try:
            await _sheet_sync_task
        except asyncio.CancelledError:
            pass
        _sheet_sync_task = None


@app.get("/", include_in_schema=False)
async def root() -> dict:
    ui = (settings.FRONTEND_URL or "").strip().rstrip("/")
    return {
        "service": "nidhamauto-api",
        "health": "/health",
        "admin_ui": f"{ui}/admin" if ui else None,
        "note": "Use /health for load balancers; open admin_ui in a browser.",
    }


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/robots.txt", include_in_schema=False)
async def robots_txt():
    return PlainTextResponse("User-agent: *\nDisallow:\n", media_type="text/plain")


app.include_router(orders_router)
app.include_router(tracking_router)
app.include_router(admin_metrics_router)


def _redirect_admin_browser():
    """Shared redirect — avoids stacked-route quirks on same handler."""
    base = (settings.FRONTEND_URL or "").strip().rstrip("/")
    if not base:
        return {"detail": "Configure FRONTEND_URL in backend .env"}
    return RedirectResponse(url=f"{base}/admin", status_code=307)


@app.get("/admin/diagnose")
async def diagnose() -> dict:
    import socket

    hosts = ["db", "nidhamauto_database", "host.docker.internal", "172.17.0.1"]
    results = {}
    for host in hosts:
        try:
            ip = socket.gethostbyname(host)
            results[host] = f"OK → {ip}"
        except Exception as e:
            results[host] = f"FAIL: {e}"
    return results


@app.get("/admin", include_in_schema=False)
async def admin_browser_redirect_root():
    return _redirect_admin_browser()


@app.get("/admin/", include_in_schema=False)
async def admin_browser_redirect_slash():
    return _redirect_admin_browser()


@app.head("/admin", include_in_schema=False)
async def admin_browser_redirect_head_root():
    """Some probes use HEAD — same redirect as GET."""
    return _redirect_admin_browser()


@app.head("/admin/", include_in_schema=False)
async def admin_browser_redirect_head_slash():
    return _redirect_admin_browser()
