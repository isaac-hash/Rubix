# app/models/customer.py
# ─────────────────────────────────────────────────────────────────────────────
# A Customer is an end user who subscribes to a merchant's product.
# Customers are created by the merchant via API (or via the payment page).
#
# Key design decisions:
#   - Customers belong to a specific merchant. The same person (same email)
#     can be a customer of multiple merchants — they're separate records.
#   - UniqueConstraint on (merchant_id, email): prevents a merchant from
#     accidentally creating the same customer twice.
#   - "claimed" means the customer has set a password and can log in to the
#     SubPay consumer dashboard to manage their own subscriptions.
#   - claim_token: a one-time token sent in renewal WhatsApp/SMS/email nudges.
#     Clicking it opens a "set password" page — frictionless onboarding.
# ─────────────────────────────────────────────────────────────────────────────

import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False
    )

    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=False)

    # Consumer dashboard account claiming
    claimed: Mapped[bool] = mapped_column(Boolean, default=False)
    password_hash: Mapped[str | None] = mapped_column(String, nullable=True)

    # Magic link token sent in renewal nudges — expires after 7 days
    claim_token: Mapped[str | None] = mapped_column(String, nullable=True)
    claim_token_expiry: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    # ── Constraints ───────────────────────────────────────────────────────────
    # Same email can exist across multiple merchants, but not within one
    __table_args__ = (UniqueConstraint("merchant_id", "email", name="uq_merchant_customer_email"),)

    # ── Relationships ─────────────────────────────────────────────────────────
    merchant = relationship("Merchant", back_populates="customers")
    subscriptions = relationship("Subscription", back_populates="customer")
