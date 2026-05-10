# app/models/virtual_account.py
# ─────────────────────────────────────────────────────────────────────────────
# A VirtualAccount is a real Nigerian bank account number (NUBAN) provisioned
# by Paystack and assigned exclusively to one subscription payment cycle.
#
# How it works:
#   1. Merchant calls POST /v1/subscriptions
#   2. SubPay calls Paystack → gets a unique account number (e.g. 9920012345)
#   3. Customer transfers exactly ₦5,000 to that account number
#   4. Paystack fires charge.success webhook → SubPay activates subscription
#
# Key design decisions:
#   - One virtual account per payment cycle. At renewal time, a NEW virtual
#     account is generated so payments can't be confused across cycles.
#   - is_active: deactivated immediately after payment is confirmed, preventing
#     the customer from accidentally paying twice.
#   - expires_at: set to 30 minutes from creation for initial payment.
#     If the customer doesn't pay in time, they start over with a fresh session.
#   - provider: designed to support both Paystack and Korapay.
# ─────────────────────────────────────────────────────────────────────────────

import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class VirtualAccount(Base):
    __tablename__ = "virtual_accounts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    subscription_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subscriptions.id"), nullable=False
    )

    # Bank details shown to the customer
    bank_name: Mapped[str] = mapped_column(String, nullable=False)
    account_number: Mapped[str] = mapped_column(String, nullable=False)
    account_name: Mapped[str] = mapped_column(String, nullable=False)

    # Which payment provider issued this account
    provider: Mapped[str] = mapped_column(String, default="paystack")  # paystack | korapay
    provider_ref: Mapped[str | None] = mapped_column(String, nullable=True)

    # Amount expected — used to validate the transfer matches the plan exactly
    amount: Mapped[int] = mapped_column(Integer, nullable=False)  # in kobo

    # Deactivated after payment OR expiry
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    subscription = relationship("Subscription", back_populates="virtual_accounts")
