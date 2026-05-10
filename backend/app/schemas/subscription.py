# app/schemas/subscription.py

from datetime import datetime, date
from uuid import UUID
from typing import Any
from pydantic import BaseModel
from app.models.subscription import SubscriptionStatus


# ── Request ───────────────────────────────────────────────────────────────────

class SubscriptionCreate(BaseModel):
    customer_id: UUID
    plan_id: UUID
    # Optional data the merchant wants back in every webhook event
    # e.g. {"user_id": "123", "tier": "gold"}
    metadata: dict[str, Any] | None = None


# ── Virtual account sub-schema ────────────────────────────────────────────────

class VirtualAccountInfo(BaseModel):
    bank_name: str
    account_number: str
    account_name: str
    amount: int          # In kobo
    expires_at: datetime

    model_config = {"from_attributes": True}


# ── Response ──────────────────────────────────────────────────────────────────

class SubscriptionResponse(BaseModel):
    id: UUID
    merchant_id: UUID
    customer_id: UUID
    plan_id: UUID
    status: SubscriptionStatus
    renewal_date: date | None
    created_at: datetime

    # Included when status is pending_payment — the account to pay into
    virtual_account: VirtualAccountInfo | None = None

    model_config = {"from_attributes": True}
