# app/api/webhooks.py
# ─────────────────────────────────────────────────────────────────────────────
# Inbound webhook from Paystack → SubPay.
#
# This is the most critical endpoint in the entire system.
# When a customer transfers money to a virtual account, Paystack fires a POST
# to this URL. Everything that matters — activating subscriptions, notifying
# merchants — flows from this handler.
#
# Security: HMAC signature verification
#   Paystack signs every webhook with your PAYSTACK_WEBHOOK_SECRET using
#   HMAC-SHA512. We verify the signature before doing anything else.
#   Any request with an invalid signature is rejected with 400.
#   This prevents attackers from faking payment events.
#
# Idempotency: provider_ref unique constraint
#   Paystack may deliver the same webhook more than once. We check if a
#   Payment record already exists for this provider_ref. If yes, we return
#   200 immediately (no duplicate processing). The DB unique constraint is
#   a second safety net at the database level.
#
# Amount matching:
#   If the customer transfers the wrong amount, we do NOT activate the
#   subscription. We flag it for manual review instead.
#
# Important: always return 200 to Paystack, even on errors.
#   If we return 4xx/5xx, Paystack retries the webhook repeatedly.
#   We should only return non-200 for genuine signature failures.
# ─────────────────────────────────────────────────────────────────────────────

import hmac
import hashlib
import json
from datetime import date, timedelta, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.config import settings
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.virtual_account import VirtualAccount
from app.models.payment import Payment, PaymentType
from app.models.webhook_delivery import WebhookDelivery, DeliveryStatus
from app.models.plan import Plan, PlanInterval

router = APIRouter()


def _verify_paystack_signature(body: bytes, signature: str) -> bool:
    """
    Verify Paystack's HMAC-SHA512 signature.
    Paystack sends the signature in the X-Paystack-Signature header.
    """
    expected = hmac.new(
        settings.PAYSTACK_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha512,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def _compute_renewal_date(interval: PlanInterval) -> date:
    """Calculate the next renewal date based on the plan interval."""
    today = date.today()
    mapping = {
        PlanInterval.daily: timedelta(days=1),
        PlanInterval.weekly: timedelta(weeks=1),
        PlanInterval.monthly: timedelta(days=30),
        PlanInterval.quarterly: timedelta(days=90),
        PlanInterval.annually: timedelta(days=365),
    }
    return today + mapping[interval]


async def _dispatch_merchant_webhook(
    subscription: Subscription,
    event: str,
    db: AsyncSession,
) -> None:
    """
    Persist a WebhookDelivery record and queue the Celery delivery task.
    We insert the DB record FIRST — that way there's always an audit trail
    even if the task queue crashes.
    """
    from app.models.merchant import Merchant
    from app.workers.tasks import deliver_merchant_webhook

    merchant = await db.get(Merchant, subscription.merchant_id)
    if not merchant or not merchant.webhook_url:
        return

    payload = {
        "event": event,
        "data": {
            "subscription_id": str(subscription.id),
            "customer_id": str(subscription.customer_id),
            "plan_id": str(subscription.plan_id),
            "status": subscription.status.value,
            "renewal_date": subscription.renewal_date.isoformat() if subscription.renewal_date else None,
            "metadata": subscription.metadata_,
        },
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    delivery = WebhookDelivery(
        merchant_id=merchant.id,
        event=event,
        payload=payload,
        status=DeliveryStatus.pending,
    )
    db.add(delivery)
    await db.flush()  # Get delivery.id before committing

    # Queue background delivery (non-blocking)
    deliver_merchant_webhook.delay(str(delivery.id))


# ── Webhook endpoint ───────────────────────────────────────────────────────────

@router.post("/webhooks/paystack")
async def paystack_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.body()
    signature = request.headers.get("x-paystack-signature", "")

    # Step 1: Verify signature — reject anything that doesn't match
    if not _verify_paystack_signature(body, signature):
        raise HTTPException(status_code=400, detail="Invalid signature")

    payload = json.loads(body)
    event = payload.get("event")
    data = payload.get("data", {})

    if event == "charge.success":
        await _handle_payment_received(data, db)

    # Always return 200 for events we don't handle
    # (Paystack sends many event types; we only care about charge.success)
    return {"status": "ok"}


async def _handle_payment_received(data: dict, db: AsyncSession) -> None:
    """
    Core payment processing logic.
    Called when Paystack confirms a transfer to one of our virtual accounts.
    """
    # Extract key fields from the Paystack payload
    account_number = (
        data.get("authorization", {}).get("receiver_bank_account_number")
        or data.get("paid_at")  # fallback field name varies by Paystack version
    )
    amount_kobo = data.get("amount")
    provider_ref = data.get("reference")

    if not all([account_number, amount_kobo, provider_ref]):
        return  # Malformed payload — ignore

    # ── Idempotency check ─────────────────────────────────────────────────────
    # If we've already processed this reference, exit immediately.
    # This handles Paystack's at-least-once delivery guarantee.
    existing_payment = await db.scalar(
        select(Payment).where(Payment.provider_ref == provider_ref)
    )
    if existing_payment:
        return

    # ── Find the matching virtual account ─────────────────────────────────────
    va = await db.scalar(
        select(VirtualAccount).where(
            VirtualAccount.account_number == account_number,
            VirtualAccount.is_active == True,
        )
    )
    if not va:
        # Payment to an unknown or already-used account — log and ignore
        print(f"[WARN] Received payment to unrecognised account: {account_number}")
        return

    # ── Load subscription and plan ────────────────────────────────────────────
    subscription = await db.get(Subscription, va.subscription_id)
    plan = await db.get(Plan, subscription.plan_id)

    # ── Amount validation ─────────────────────────────────────────────────────
    if amount_kobo != plan.amount:
        # Wrong amount — flag for manual review, do NOT activate
        print(
            f"[WARN] Amount mismatch on subscription {subscription.id}: "
            f"expected {plan.amount} kobo, got {amount_kobo} kobo. Ref: {provider_ref}"
        )
        # TODO Phase 4: Create a PaymentMismatch record for merchant dashboard review
        return

    # ── Record the payment ────────────────────────────────────────────────────
    payment_type = (
        PaymentType.initial
        if subscription.status == SubscriptionStatus.pending_payment
        else PaymentType.renewal
    )
    payment = Payment(
        subscription_id=subscription.id,
        amount=amount_kobo,
        currency="NGN",
        provider="paystack",
        provider_ref=provider_ref,
        type=payment_type,
    )
    db.add(payment)

    # ── Activate the subscription ─────────────────────────────────────────────
    subscription.status = SubscriptionStatus.active
    subscription.renewal_date = _compute_renewal_date(plan.interval)

    # ── Deactivate the virtual account ────────────────────────────────────────
    # Prevents double-payment: this account number is now spent
    va.is_active = False

    await db.commit()

    # ── Fire outbound merchant webhook ────────────────────────────────────────
    await _dispatch_merchant_webhook(subscription, "subscription.activated", db)
    await db.commit()  # Commit the webhook delivery record
