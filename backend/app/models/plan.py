# app/models/plan.py
# ─────────────────────────────────────────────────────────────────────────────
# A Plan is a merchant's pricing tier — "Basic Monthly ₦5,000" for example.
# Merchants create plans, then create subscriptions that reference a plan.
#
# Key design decisions:
#   - amount is stored in kobo (the smallest Nigerian currency unit, like cents).
#     ₦5,000 = 500,000 kobo. This avoids floating point errors entirely.
#     Always store money as integers in the smallest unit.
#   - interval uses a Python Enum mapped to a PostgreSQL ENUM type.
#     This means the DB itself rejects invalid values — not just the app.
#   - Plans can be archived (is_active=False) but never deleted if subscriptions
#     reference them — that would break payment history.
# ─────────────────────────────────────────────────────────────────────────────

import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, func, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PlanInterval(str, enum.Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    quarterly = "quarterly"
    annually = "annually"


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False
    )

    name: Mapped[str] = mapped_column(String, nullable=False)  # e.g. "Basic Monthly"

    # Always store in kobo (lowest currency unit) — never use floats for money
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="NGN")

    interval: Mapped[PlanInterval] = mapped_column(
        Enum(PlanInterval), nullable=False
    )

    # Soft delete — don't hard-delete plans that have subscriptions
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    merchant = relationship("Merchant", back_populates="plans")
    subscriptions = relationship("Subscription", back_populates="plan")
