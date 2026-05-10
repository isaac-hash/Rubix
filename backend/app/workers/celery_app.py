# app/workers/celery_app.py
# ─────────────────────────────────────────────────────────────────────────────
# Celery is a task queue — it lets us run code in the background without
# blocking the HTTP response.
#
# Why do we need it here?
#   When a charge.success webhook arrives, we must respond to Paystack within
#   5 seconds or Paystack thinks we failed and retries. But we also need to
#   POST to the merchant's webhook URL, which could be slow. So we:
#     1. Handle the payment in the request (fast DB writes)
#     2. Queue the outbound merchant webhook as a Celery task (background)
#     3. Return 200 to Paystack immediately
#
# Celery Beat (the scheduler) is added in Phase 3 for renewal jobs.
# ─────────────────────────────────────────────────────────────────────────────

from celery import Celery
from celery.schedules import crontab
from app.config import settings


celery_app = Celery(
    "subpay",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.workers.tasks",    # Webhook delivery
        "app.workers.renewal",  # Renewal engine
    ],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Africa/Lagos",
    enable_utc=True,
    task_always_eager=False,
)

# ── Celery Beat schedule ───────────────────────────────────────────────────────
# celery -A app.workers.celery_app beat --loglevel=info
#
# All jobs are aligned to Nigerian business hours (WAT = UTC+1).
# 08:00 WAT = 07:00 UTC. Reminders and renewals fire before the business day.
celery_app.conf.beat_schedule = {
    # 1. Send 3-day-ahead reminders at 08:00 WAT
    "send-renewal-reminders-daily": {
        "task": "app.workers.renewal.send_renewal_reminders",
        "schedule": crontab(hour=7, minute=0),  # 08:00 WAT
    },
    # 2. Provision renewal accounts at 08:30 WAT
    "check-renewals-daily": {
        "task": "app.workers.renewal.check_renewals",
        "schedule": crontab(hour=7, minute=30),  # 08:30 WAT
    },
    # 3. Mark lapsed subscriptions at 09:00 WAT (after 3-day grace period)
    "check-lapsed-daily": {
        "task": "app.workers.renewal.check_lapsed",
        "schedule": crontab(hour=8, minute=0),  # 09:00 WAT
    },
}

