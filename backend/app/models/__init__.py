# app/models/__init__.py
# ─────────────────────────────────────────────────────────────────────────────
# Import all models here so that:
#   1. Alembic autogenerate can discover every table in one import
#   2. SQLAlchemy relationship references resolve correctly
#
# In alembic/env.py you'll do:
#   from app.models import *       # noqa — loads all models into metadata
#   target_metadata = Base.metadata
# ─────────────────────────────────────────────────────────────────────────────

from app.models.merchant import Merchant
from app.models.customer import Customer
from app.models.plan import Plan
from app.models.subscription import Subscription
from app.models.virtual_account import VirtualAccount
from app.models.payment import Payment
from app.models.webhook_delivery import WebhookDelivery

__all__ = [
    "Merchant",
    "Customer",
    "Plan",
    "Subscription",
    "VirtualAccount",
    "Payment",
    "WebhookDelivery",
]

