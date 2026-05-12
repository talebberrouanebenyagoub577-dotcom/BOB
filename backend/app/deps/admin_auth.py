from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from app.config import settings

bearer = HTTPBearer(auto_error=False)

JWT_ALG = "HS256"
TOKEN_HOURS = 12


class LoginBody(BaseModel):
    username: str
    password: str


def _jwt_secret() -> str:
    s = (settings.ADMIN_JWT_SECRET or settings.SECRET_KEY or "").strip()
    if len(s) < 8:
        return ""
    return s


def create_admin_token() -> str:
    secret = _jwt_secret()
    if not secret:
        raise HTTPException(status_code=503, detail="Admin JWT not configured")
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "admin",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=TOKEN_HOURS)).timestamp()),
        "scope": "admin",
    }
    return jwt.encode(payload, secret, algorithm=JWT_ALG)


def verify_admin(
    cred: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> None:
    if cred is None or cred.scheme.lower() != "bearer":
        raise HTTPException(status_code=403, detail="Missing bearer token")

    secret = _jwt_secret()
    if not secret:
        raise HTTPException(status_code=503, detail="Admin JWT not configured")

    try:
        jwt.decode(cred.credentials, secret, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(status_code=403, detail="Invalid or expired token")
