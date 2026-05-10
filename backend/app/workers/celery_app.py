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
from app.config import settings

celery_app = Celery(
    "subpay",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Africa/Lagos",
    enable_utc=True,
    # Tasks always run eagerly in tests — no worker needed
    task_always_eager=False,
)
