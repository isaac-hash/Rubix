# app/models/payment.py
# ─────────────────────────────────────────────────────────────────────────────
# A Payment records every confirmed transfer received for a subscription.
#
# Key design decisions:
#   - provider_ref has a UNIQUE constraint. This is the idempotency guard.
#     Paystack may send the same charge.success webhook more than once.
#     By making provider_ref unique, the second attempt to INSERT the same
#     payment fails at the database level — the subscription can never be
#     activated twice for the same transfer.
#   - type distinguishes the first payment ("initial") from renewals.
#     This is important for analytics and for the merchant dashboard.
# ─────────────────────────────────────────────────────────────────────────────

import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Integer, DateTime, ForeignKey, func, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PaymentType(str, enum.Enum):
    initial = "initial"     # First payment that activates the subscription
    renewal = "renewal"     # Subsequent periodic payments


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    subscription_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subscriptions.id"), nullable=False
    )

    amount: Mapped[int] = mapped_column(Integer, nullable=False)    # in kobo
    currency: Mapped[str] = mapped_column(String(3), default="NGN")

    provider: Mapped[str] = mapped_column(String, nullable=False)   # paystack | korapay

    # Paystack's unique reference for this transfer
    # UNIQUE — this is our idempotency key against duplicate webhooks
    provider_ref: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    type: Mapped[PaymentType] = mapped_column(Enum(PaymentType), nullable=False)

    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    subscription = relationship("Subscription", back_populates="payments")
