# app/models/webhook_delivery.py
# ─────────────────────────────────────────────────────────────────────────────
# A WebhookDelivery tracks every outbound webhook SubPay sends to a merchant.
#
# Why persist this?
#   Webhook delivery is handled as a background Celery task with retries.
#   If the merchant's server is down, we retry with exponential backoff
#   (1min → 5min → 15min → 1hr → 4hr). This table is the audit trail.
#
# Key design decisions:
#   - We INSERT the record BEFORE queuing the Celery task. This ensures
#     we always have a record of intent, even if the task queue crashes.
#   - attempts + last_attempted: lets us see exactly how many retries
#     happened and when, useful for debugging merchant integration issues.
#   - status enum: 'pending' → 'delivered' on success, 'failed' after
#     all retries are exhausted.
# ─────────────────────────────────────────────────────────────────────────────

import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Integer, DateTime, ForeignKey, func, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DeliveryStatus(str, enum.Enum):
    pending = "pending"
    delivered = "delivered"
    failed = "failed"


class WebhookDelivery(Base):
    __tablename__ = "webhook_deliveries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False
    )

    # e.g. "subscription.activated", "subscription.lapsed", "subscription.cancelled"
    event: Mapped[str] = mapped_column(String, nullable=False)

    # Full JSON payload that was (or will be) POSTed to the merchant
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)

    status: Mapped[DeliveryStatus] = mapped_column(
        Enum(DeliveryStatus), default=DeliveryStatus.pending
    )

    attempts: Mapped[int] = mapped_column(Integer, default=0)
    last_attempted: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    delivered_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    merchant = relationship("Merchant")
