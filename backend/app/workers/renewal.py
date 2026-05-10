# app/workers/renewal.py
# ─────────────────────────────────────────────────────────────────────────────
# Renewal Engine — three Celery Beat jobs that drive the subscription lifecycle.
#
# How the renewal cycle works:
#
#   Day 0 (original signup):
#     - Customer pays → subscription becomes `active`
#     - renewal_date = today + 30 days (for monthly plans)
#
#   Day 27 (3 days before renewal):
#     - send_renewal_reminders fires
#     - Customer receives: "Your ₦5,000 subscription renews in 3 days"
#
#   Day 30 (renewal_date):
#     - check_renewals fires
#     - Subscription moves: active → pending_renewal
#     - New virtual account provisioned (30-min window)
#     - Customer receives: "Please transfer ₦5,000 to account 0123456789 (Wema Bank)"
#
#   Day 30–33 (grace period):
#     - check_lapsed runs daily
#     - If customer pays → webhook fires → subscription goes active again
#       renewal_date is pushed forward another 30 days
#
#   Day 33 (end of grace period — no payment):
#     - Subscription moves: pending_renewal → lapsed
#     - Merchant receives: subscription.lapsed webhook
#
# IMPORTANT: These tasks use SYNCHRONOUS SQLAlchemy (psycopg2) because
# Celery workers run in a thread pool, not an asyncio event loop.
# The Paystack API calls use synchronous httpx.
# ─────────────────────────────────────────────────────────────────────────────

import httpx
from datetime import date, timedelta, datetime, timezone
from celery import shared_task

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker, Session

from app.config import settings
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.plan import Plan
from app.models.virtual_account import VirtualAccount
from app.models.customer import Customer

# ── Sync DB setup for Celery workers ──────────────────────────────────────────
_sync_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
_engine = create_engine(_sync_url)
_Session = sessionmaker(bind=_engine)

GRACE_PERIOD_DAYS = 3  # Days after renewal_date before marking lapsed


# ── Helper: provision a virtual account synchronously ─────────────────────────

def _provision_virtual_account_sync(customer: Customer, plan: Plan, subscription_id) -> dict | None:
    """
    Call Paystack synchronously to get a new virtual account for a renewal.
    Returns the account data dict or None on failure.
    """
    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }
    parts = customer.name.strip().split(" ", 1)
    try:
        r = httpx.post(
            "https://api.paystack.co/dedicated_account/assign",
            headers=headers,
            json={
                "email": customer.email,
                "first_name": parts[0],
                "last_name": parts[1] if len(parts) > 1 else parts[0],
                "phone": customer.phone,
                "preferred_bank": "wema-bank",
                "country": "NG",
            },
            timeout=30.0,
        )
        r.raise_for_status()
        return r.json()["data"]
    except Exception as e:
        print(f"[ERROR] Failed to provision virtual account for subscription {subscription_id}: {e}")
        return None


# ── Task 1: check_renewals ─────────────────────────────────────────────────────

@shared_task(name="app.workers.renewal.check_renewals")
def check_renewals():
    """
    Run daily. Find all active subscriptions whose renewal_date is today,
    provision new virtual accounts, and move them to pending_renewal.

    This is a batch job — it processes all due subscriptions in one run.
    """
    today = date.today()
    processed = 0
    failed = 0

    with _Session() as db:
        # Find every subscription that's due for renewal today
        due_subs = db.execute(
            select(Subscription).where(
                Subscription.status == SubscriptionStatus.active,
                Subscription.renewal_date == today,
            )
        ).scalars().all()

        print(f"[RENEWAL] Found {len(due_subs)} subscriptions due for renewal today ({today})")

        for sub in due_subs:
            customer = db.get(Customer, sub.customer_id)
            plan = db.get(Plan, sub.plan_id)

            # Provision a new virtual account
            account_data = _provision_virtual_account_sync(customer, plan, sub.id)

            if account_data is None:
                failed += 1
                continue  # Will retry next daily run

            # Create new virtual account record
            va = VirtualAccount(
                subscription_id=sub.id,
                bank_name=account_data.get("bank", {}).get("name", ""),
                account_number=account_data.get("account_number", ""),
                account_name=account_data.get("account_name", ""),
                provider="paystack",
                provider_ref=str(account_data.get("id", "")),
                amount=plan.amount,
                # Renewal window is longer than initial — give customers 3 days
                expires_at=datetime.now(timezone.utc) + timedelta(days=3),
            )
            db.add(va)

            # Move subscription to pending_renewal
            sub.status = SubscriptionStatus.pending_renewal
            processed += 1

            # Queue renewal notification to customer
            send_renewal_payment_prompt.delay(str(sub.id))

        db.commit()

    print(f"[RENEWAL] Done. Processed: {processed}, Failed: {failed}")
    return {"processed": processed, "failed": failed}


# ── Task 2: send_renewal_reminders ────────────────────────────────────────────

@shared_task(name="app.workers.renewal.send_renewal_reminders")
def send_renewal_reminders():
    """
    Run daily. Find subscriptions renewing in exactly 3 days and notify the customer.
    This gives them time to ensure their account has the right balance.

    Currently logs to console. In production: integrate Termii (SMS) or
    WhatsApp Business API to reach Nigerian customers on mobile.
    """
    reminder_date = date.today() + timedelta(days=GRACE_PERIOD_DAYS)

    with _Session() as db:
        due_soon = db.execute(
            select(Subscription).where(
                Subscription.status == SubscriptionStatus.active,
                Subscription.renewal_date == reminder_date,
            )
        ).scalars().all()

        print(f"[REMINDER] Sending {len(due_soon)} renewal reminders for {reminder_date}")

        for sub in due_soon:
            customer = db.get(Customer, sub.customer_id)
            plan = db.get(Plan, sub.plan_id)
            amount_naira = plan.amount / 100  # kobo → naira for display

            # TODO Phase 4: Replace with real SMS/WhatsApp via Termii
            print(
                f"[SMS stub] To: {customer.phone} | "
                f"Message: 'Your {plan.name} subscription of ₦{amount_naira:,.0f} "
                f"renews on {reminder_date}. Please ensure funds are available.'"
            )

    return {"reminded": len(due_soon)}


# ── Task 3: check_lapsed ──────────────────────────────────────────────────────

@shared_task(name="app.workers.renewal.check_lapsed")
def check_lapsed():
    """
    Run daily. Find subscriptions that have been in pending_renewal for longer
    than GRACE_PERIOD_DAYS and mark them as lapsed.

    We check `renewal_date + GRACE_PERIOD_DAYS < today` to find overdue renewals.
    The virtual account is deactivated and the merchant is notified.
    """
    lapse_cutoff = date.today() - timedelta(days=GRACE_PERIOD_DAYS)
    lapsed_count = 0

    with _Session() as db:
        overdue = db.execute(
            select(Subscription).where(
                Subscription.status == SubscriptionStatus.pending_renewal,
                Subscription.renewal_date <= lapse_cutoff,
            )
        ).scalars().all()

        print(f"[LAPSE] Found {len(overdue)} subscriptions past grace period")

        for sub in overdue:
            # Deactivate any open virtual accounts
            open_vas = db.execute(
                select(VirtualAccount).where(
                    VirtualAccount.subscription_id == sub.id,
                    VirtualAccount.is_active == True,
                )
            ).scalars().all()
            for va in open_vas:
                va.is_active = False

            # Mark as lapsed
            sub.status = SubscriptionStatus.lapsed
            lapsed_count += 1

            # Queue merchant notification
            notify_merchant_subscription_lapsed.delay(str(sub.id))

        db.commit()

    print(f"[LAPSE] Marked {lapsed_count} subscriptions as lapsed")
    return {"lapsed": lapsed_count}


# ── Notification tasks ────────────────────────────────────────────────────────

@shared_task(name="app.workers.renewal.send_renewal_payment_prompt")
def send_renewal_payment_prompt(subscription_id: str):
    """
    Send the customer their new virtual account details for this renewal cycle.
    Called immediately after check_renewals provisions the account.
    """
    with _Session() as db:
        sub = db.get(Subscription, subscription_id)
        customer = db.get(Customer, sub.customer_id)
        plan = db.get(Plan, sub.plan_id)

        va = db.execute(
            select(VirtualAccount).where(
                VirtualAccount.subscription_id == sub.id,
                VirtualAccount.is_active == True,
            ).order_by(VirtualAccount.created_at.desc())
        ).scalar_one_or_none()

        if not va:
            print(f"[WARN] No virtual account found for renewal of subscription {subscription_id}")
            return

        amount_naira = plan.amount / 100
        # TODO Phase 4: Real SMS/WhatsApp via Termii
        print(
            f"[SMS stub] To: {customer.phone} | "
            f"'Transfer ₦{amount_naira:,.0f} to {va.account_number} ({va.bank_name}) "
            f"to renew your {plan.name} subscription. "
            f"Reference: your name. Expires in 3 days.'"
        )


@shared_task(name="app.workers.renewal.notify_merchant_subscription_lapsed")
def notify_merchant_subscription_lapsed(subscription_id: str):
    """
    Fire a subscription.lapsed webhook to the merchant so they can
    revoke access in their system.
    """
    from app.models.webhook_delivery import WebhookDelivery, DeliveryStatus
    from app.workers.tasks import deliver_merchant_webhook

    with _Session() as db:
        sub = db.get(Subscription, subscription_id)

        payload = {
            "event": "subscription.lapsed",
            "data": {
                "subscription_id": str(sub.id),
                "customer_id": str(sub.customer_id),
                "plan_id": str(sub.plan_id),
                "renewal_date": sub.renewal_date.isoformat() if sub.renewal_date else None,
                "metadata": sub.metadata_,
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        delivery = WebhookDelivery(
            merchant_id=sub.merchant_id,
            event="subscription.lapsed",
            payload=payload,
            status=DeliveryStatus.pending,
        )
        db.add(delivery)
        db.commit()
        db.refresh(delivery)

    deliver_merchant_webhook.delay(str(delivery.id))
