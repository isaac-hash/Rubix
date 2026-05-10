# app/schemas/merchant.py
# ─────────────────────────────────────────────────────────────────────────────
# Pydantic schemas define the shape of data coming IN (requests) and going OUT
# (responses). They are separate from SQLAlchemy models on purpose:
#
#   SQLAlchemy model  = how data is stored in the database
#   Pydantic schema   = what the API accepts and returns
#
# This separation means you can:
#   - Exclude sensitive fields (like secret_key_hash) from responses
#   - Accept different fields on create vs update
#   - Add computed fields to responses that don't exist in the DB
# ─────────────────────────────────────────────────────────────────────────────

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr


# ── Request schemas (what the client sends) ───────────────────────────────────

class MerchantSignup(BaseModel):
    name: str
    email: EmailStr
    # Raw password — only used during signup, never stored directly
    password: str


# ── Response schemas (what the API returns) ───────────────────────────────────

class MerchantResponse(BaseModel):
    id: UUID
    name: str
    email: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}  # Allows creating from ORM objects


class MerchantSignupResponse(BaseModel):
    """
    Returned ONLY on signup. This is the one time we show the raw API key.
    After this, the key is hashed and can never be recovered — only rotated.
    """
    merchant: MerchantResponse
    api_key: str  # Raw key — shown once, store it safely
