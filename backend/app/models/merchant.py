# app/models/merchant.py
# ─────────────────────────────────────────────────────────────────────────────
# A Merchant is a business that uses SubPay to collect subscription payments.
# They sign up, get API keys, and integrate SubPay into their product.
#
# Key design decisions:
#   - We never store the raw API key — only a bcrypt hash of it.
#     This means even if the DB is breached, keys can't be used.
#   - webhook_url + webhook_secret: when a payment is confirmed, SubPay POSTs
#     to this URL signed with this secret so the merchant can verify it's real.
# ─────────────────────────────────────────────────────────────────────────────

import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Merchant(Base):
    __tablename__ = "merchants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    # bcrypt hash of the API key — NEVER the raw key
    secret_key_hash: Mapped[str] = mapped_column(String, nullable=False)

    # Where SubPay POSTs subscription events (payment received, lapsed, etc.)
    webhook_url: Mapped[str | None] = mapped_column(String, nullable=True)
    # HMAC secret used to sign outbound webhook payloads
    webhook_secret: Mapped[str | None] = mapped_column(String, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    # These let you do: merchant.customers, merchant.plans, etc.
    customers = relationship("Customer", back_populates="merchant")
    plans = relationship("Plan", back_populates="merchant")
    subscriptions = relationship("Subscription", back_populates="merchant")
