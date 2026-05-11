# app/dependencies.py
# ─────────────────────────────────────────────────────────────────────────────
# Shared FastAPI dependencies — functions injected into routes via Depends().
#
# The key one here is get_current_merchant():
#   Every API endpoint (except /webhooks/paystack) requires a merchant to be
#   authenticated. Merchants authenticate with a Bearer API key in the header.
#
# How it works:
#   1. Merchant sends: Authorization: Bearer sk_test_abc123
#   2. We hash the incoming key with bcrypt
#   3. We look up a merchant whose secret_key_hash matches
#   4. We inject that merchant object into the route handler
#
# This means route handlers never touch auth logic — they just declare:
#   async def my_route(merchant: Merchant = Depends(get_current_merchant))
#
# WHAT COMES NEXT:
#   - Once models/merchant.py exists, uncomment the real DB lookup below
#   - Add get_current_customer() for consumer dashboard endpoints (Phase 5)
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import hashlib
from app.database import get_db

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_key(raw_key: str) -> str:
    """Hash an API key for safe storage."""
    return hashlib.sha256(raw_key.encode()).hexdigest()


def verify_key(raw_key: str, hashed: str) -> bool:
    """Check a raw API key against its stored hash."""
    return hashlib.sha256(raw_key.encode()).hexdigest() == hashed


def hash_password(password: str) -> str:
    """Hash a plaintext password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plaintext password against its stored hash."""
    return pwd_context.verify(plain_password, hashed_password)



async def get_current_merchant(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Extract + validate the merchant's Bearer credential.
    Supports either a Raw API Key or a JWT Session Token.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must be: Bearer <token>",
        )

    token = authorization.split(" ")[1]

    # 1. Try treating it as a JWT (Dashboard Session)
    from jose import jwt, JWTError
    SECRET_KEY = "rubix_super_secret_session_key"
    ALGORITHM = "HS256"
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        merchant_id = payload.get("sub")
        if merchant_id:
            from app.models.merchant import Merchant
            merchant = await db.get(Merchant, merchant_id)
            if merchant and merchant.is_active:
                return merchant
    except JWTError:
        pass # Not a valid JWT, try API Key instead

    # 2. Try treating it as a Raw API Key (Server-to-Server)
    from app.models.merchant import Merchant
    result = await db.execute(
        select(Merchant).where(Merchant.is_active == True)
    )
    merchants = result.scalars().all()
    for m in merchants:
        if verify_key(token, m.secret_key_hash):
            return m

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credential",
    )

