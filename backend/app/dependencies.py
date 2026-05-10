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
from passlib.context import CryptContext

from app.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_key(raw_key: str) -> str:
    """Hash an API key for safe storage. Never store raw keys."""
    return pwd_context.hash(raw_key)


def verify_key(raw_key: str, hashed: str) -> bool:
    """Check a raw API key against its stored hash."""
    return pwd_context.verify(raw_key, hashed)


async def get_current_merchant(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Extract + validate the merchant's Bearer API key.
    Raises 401 if missing, malformed, or invalid.
    
    Usage in a route:
        async def create_customer(merchant = Depends(get_current_merchant)):
            ...
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must be: Bearer <api_key>",
        )

    raw_key = authorization.split(" ")[1]

    # TODO: Uncomment once Merchant model exists (Phase 1, Step 2)
    # from app.models.merchant import Merchant
    # result = await db.execute(select(Merchant).where(Merchant.is_active == True))
    # merchants = result.scalars().all()
    # for m in merchants:
    #     if verify_key(raw_key, m.secret_key_hash):
    #         return m

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid API key",
    )
