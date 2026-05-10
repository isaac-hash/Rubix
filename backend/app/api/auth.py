# app/api/auth.py
# ─────────────────────────────────────────────────────────────────────────────
# Merchant registration — the entry point for any new business using SubPay.
#
# What happens on signup:
#   1. Check email isn't already registered
#   2. Generate a random API key (e.g. "sk_live_abc123xyz...")
#   3. Hash that key with bcrypt — only the hash is stored
#   4. Return the RAW key to the merchant THIS ONE TIME ONLY
#      (they must save it — SubPay cannot recover it, only rotate it)
#
# Why generate a random key instead of using a JWT?
#   API keys are simpler for server-to-server use. The merchant embeds the key
#   in their backend — it doesn't expire unless rotated intentionally.
#   JWTs are better for short-lived browser sessions (used in the dashboards).
# ─────────────────────────────────────────────────────────────────────────────

import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.merchant import Merchant
from app.schemas.merchant import MerchantSignup, MerchantResponse, MerchantSignupResponse
from app.dependencies import hash_key

router = APIRouter()


def generate_api_key() -> str:
    """
    Generate a cryptographically secure random API key.
    Format: sk_live_<40 random hex chars>
    secrets.token_hex is the right tool — random.random() is NOT secure enough.
    """
    return f"sk_live_{secrets.token_hex(20)}"


@router.post(
    "/auth/signup",
    response_model=MerchantSignupResponse,
    status_code=status.HTTP_201_CREATED,
)
async def merchant_signup(
    body: MerchantSignup,
    db: AsyncSession = Depends(get_db),
):
    # 1. Check for duplicate email
    existing = await db.scalar(
        select(Merchant).where(Merchant.email == body.email)
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A merchant with this email already exists",
        )

    # 2. Generate API key + hash it
    raw_key = generate_api_key()
    hashed = hash_key(raw_key)

    # 3. Create merchant record
    merchant = Merchant(
        name=body.name,
        email=body.email,
        secret_key_hash=hashed,
    )
    db.add(merchant)
    await db.commit()
    await db.refresh(merchant)

    # 4. Return merchant + raw key (only time it's ever visible)
    return MerchantSignupResponse(
        merchant=MerchantResponse.model_validate(merchant),
        api_key=raw_key,
    )
