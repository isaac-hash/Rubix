# app/models/subscription.py
# ─────────────────────────────────────────────────────────────────────────────
# A Subscription is the link between a Customer and a Plan.
# It tracks the full lifecycle of a recurring payment relationship.
#
# Status lifecycle:
#
#   pending_payment  →  active  →  pending_renewal  →  active  (renewed)
#                                                    →  lapsed  (no payment)
#   (any state)      →  cancelled  (terminal — no recovery)
#
# Key design decisions:
#   - metadata (JSONB): merchants can attach any data here (e.g. their internal
#     user_id). It's returned in all webhook events so merchants can map
#     SubPay events back to their own database records.
#   - renewal_date: set when subscription activates. The renewal engine
#     (Phase 3) queries this daily to send reminders and detect lapses.
# ─────────────────────────────────────────────────────────────────────────────

import uuid
import enum
from datetime import datetime, date

from sqlalchemy import String, DateTime, Date, ForeignKey, func, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SubscriptionStatus(str, enum.Enum):
    pending_payment = "pending_payment"   # Waiting for first payment
    active = "active"                     # Payment confirmed, sub is live
    pending_renewal = "pending_renewal"   # Reminder sent, waiting for renewal
    lapsed = "lapsed"                     # Grace period passed, no payment
    cancelled = "cancelled"               # Merchant or customer cancelled
    expired = "expired"                   # Fixed-term plan ended


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False
    )
    plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("plans.id"), nullable=False
    )

    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus), default=SubscriptionStatus.pending_payment
    )

    # Merchant-supplied passthrough data — returned in all webhook events
    metadata_: Mapped[dict | None] = mapped_column(
        "metadata", JSONB, nullable=True
    )

    # Set when subscription activates — the renewal engine queries this
    renewal_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    merchant = relationship("Merchant", back_populates="subscriptions")
    customer = relationship("Customer", back_populates="subscriptions")
    plan = relationship("Plan", back_populates="subscriptions")
    virtual_accounts = relationship("VirtualAccount", back_populates="subscription")
    payments = relationship("Payment", back_populates="subscription")
