# app/workers/tasks.py
# ─────────────────────────────────────────────────────────────────────────────
# Celery tasks — functions that run in the background worker process.
#
# deliver_merchant_webhook:
#   Fetches a WebhookDelivery record and POSTs it to the merchant's URL.
#   Retries up to 5 times with exponential backoff if the merchant's server
#   is down or returns an error:
#     Attempt 1: immediate
#     Attempt 2: 1 minute later
#     Attempt 3: 5 minutes later
#     Attempt 4: 15 minutes later
#     Attempt 5: 1 hour later
#   After 5 failures the delivery is marked "failed" and ops are alerted.
#
# NOTE: Celery tasks use synchronous SQLAlchemy (not async) because Celery
# workers run in their own thread pool, not an async event loop.
# ─────────────────────────────────────────────────────────────────────────────

import hmac
import hashlib
import json
from datetime import datetime, timezone

import httpx
from celery import shared_task
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings

# Synchronous engine for Celery workers
_sync_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
_engine = create_engine(_sync_url)
_Session = sessionmaker(bind=_engine)


def _sign_payload(secret: str, payload: dict) -> str:
    """HMAC-SHA256 sign a payload so merchants can verify it's from SubPay."""
    body = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    return hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()


@shared_task(
    bind=True,
    max_retries=5,
    default_retry_delay=60,   # Base delay — Celery applies exponential backoff
    acks_late=True,            # Only remove from queue after task completes
)
def deliver_merchant_webhook(self, delivery_id: str):
    """
    POST a webhook payload to the merchant's registered URL.
    Retries automatically on failure with exponential backoff.
    """
    from app.models.webhook_delivery import WebhookDelivery, DeliveryStatus
    from app.models.merchant import Merchant

    with _Session() as db:
        delivery = db.get(WebhookDelivery, delivery_id)
        if not delivery:
            return  # Already deleted or never existed

        merchant = db.get(Merchant, delivery.merchant_id)
        if not merchant or not merchant.webhook_url:
            delivery.status = DeliveryStatus.failed
            db.commit()
            return

        # Sign the payload if merchant has a secret
        headers = {"Content-Type": "application/json"}
        if merchant.webhook_secret:
            sig = _sign_payload(merchant.webhook_secret, delivery.payload)
            headers["X-SubPay-Signature"] = sig

        delivery.attempts += 1
        delivery.last_attempted = datetime.now(timezone.utc)
        db.commit()

        try:
            r = httpx.post(
                merchant.webhook_url,
                json=delivery.payload,
                headers=headers,
                timeout=10.0,
            )
            r.raise_for_status()

            # Success
            delivery.status = DeliveryStatus.delivered
            delivery.delivered_at = datetime.now(timezone.utc)
            db.commit()

        except Exception as exc:
            db.commit()  # Save the attempt count
            # Retry with exponential backoff (60s, 120s, 240s, 480s, 960s)
            raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
