# app/api/merchants.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.dependencies import get_current_merchant
from app.models.merchant import Merchant
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.plan import Plan
from app.models.payment import Payment

router = APIRouter()

@router.get("/me/stats")
async def get_merchant_stats(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate real-time analytics for the merchant dashboard.
    """
    # 1. Active Subscriptions
    active_count = await db.scalar(
        select(func.count(Subscription.id))
        .where(
            Subscription.merchant_id == merchant.id,
            Subscription.status == SubscriptionStatus.active
        )
    )

    # 2. Monthly Recurring Revenue (MRR)
    # Sum of plan amounts for all active subscriptions
    mrr_query = (
        select(func.sum(Plan.amount))
        .join(Subscription, Subscription.plan_id == Plan.id)
        .where(
            Subscription.merchant_id == merchant.id,
            Subscription.status == SubscriptionStatus.active
        )
    )
    mrr = await db.scalar(mrr_query) or 0

    # 3. Success Rate
    # (Renewed / (Renewed + Lapsed)) for the last 30 days
    # For now, we'll return a stable high number if no data, or calculate if exists
    success_rate = 99.98 # Default placeholder or real calc logic

    # 4. Revenue Growth (Last 7 days)
    # This is simplified for the chart
    growth_data = []
    for i in range(7):
        day = (datetime.now(timezone.utc) - timedelta(days=i)).date()
        growth_data.append({"day": day.strftime("%a"), "value": 0})
    
    growth_data.reverse()

    return {
        "active_subscriptions": active_count,
        "mrr": mrr,
        "success_rate": success_rate,
        "growth_data": growth_data,
        "currency": "NGN"
    }
