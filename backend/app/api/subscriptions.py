# app/api/subscriptions.py
# ─────────────────────────────────────────────────────────────────────────────
# Subscription endpoints — the core of the entire system.
#
# POST /v1/subscriptions is the most important endpoint in the API.
# It does all of this in one request:
#   1. Validates that the customer and plan both belong to this merchant
#   2. Checks no active subscription already exists for this customer+plan
#   3. Creates the Subscription record (status: pending_payment)
#   4. Calls Paystack to provision a dedicated virtual bank account
#   5. Stores the virtual account (expires in 30 minutes)
#   6. Returns everything the merchant needs to show the customer where to pay
#
# The subscription then sits in pending_payment until the charge.success
# webhook arrives (handled in app/api/webhooks.py — Phase 1, next step).
# ─────────────────────────────────────────────────────────────────────────────

from datetime import datetime, timedelta, timezone
from uuid import UUID
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.dependencies import get_current_merchant
from app.models.customer import Customer
from app.models.merchant import Merchant
from app.models.plan import Plan
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.virtual_account import VirtualAccount
from app.schemas.subscription import SubscriptionCreate, SubscriptionResponse, VirtualAccountInfo
from app.services import paystack

router = APIRouter()


@router.post(
    "/subscriptions",
    response_model=SubscriptionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_subscription(
    body: SubscriptionCreate,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    # ── 1. Validate customer belongs to this merchant ─────────────────────────
    customer = await db.scalar(
        select(Customer).where(
            Customer.id == body.customer_id,
            Customer.merchant_id == merchant.id,
        )
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # ── 2. Validate plan belongs to this merchant and is active ───────────────
    plan = await db.scalar(
        select(Plan).where(
            Plan.id == body.plan_id,
            Plan.merchant_id == merchant.id,
            Plan.is_active == True,
        )
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found or inactive")

    # ── 3. Check for existing active/pending subscription ─────────────────────
    # Prevents a customer from being double-billed for the same plan
    existing = await db.scalar(
        select(Subscription).where(
            Subscription.customer_id == customer.id,
            Subscription.plan_id == plan.id,
            Subscription.status.in_([
                SubscriptionStatus.active,
                SubscriptionStatus.pending_payment,
                SubscriptionStatus.pending_renewal,
            ])
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An active or pending subscription already exists for this customer and plan",
        )

    # ── 4. Create subscription record ─────────────────────────────────────────
    subscription = Subscription(
        merchant_id=merchant.id,
        customer_id=customer.id,
        plan_id=plan.id,
        status=SubscriptionStatus.pending_payment,
        metadata_=body.metadata,
    )
    db.add(subscription)
    await db.flush()  # Get the subscription.id without committing yet

    # ── 5. Call Paystack to provision virtual account ─────────────────────────
    try:
        account_data = await paystack.assign_dedicated_virtual_account(
            email=customer.email,
            name=customer.name,
            phone=customer.phone,
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to provision virtual account: {str(e)}",
        )

    # ── 6. Store virtual account (expires in 30 minutes) ─────────────────────
    va = VirtualAccount(
        subscription_id=subscription.id,
        bank_name=account_data.get("bank", {}).get("name", ""),
        account_number=account_data.get("account_number", ""),
        account_name=account_data.get("account_name", ""),
        provider="paystack",
        provider_ref=account_data.get("id"),
        amount=plan.amount,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
    )
    db.add(va)
    await db.commit()
    await db.refresh(subscription)
    await db.refresh(va)

    # ── 7. Return subscription + virtual account details ──────────────────────
    response = SubscriptionResponse.model_validate(subscription)
    response.virtual_account = VirtualAccountInfo.model_validate(va)
    return response


@router.get("/subscriptions/{subscription_id}", response_model=SubscriptionResponse)
async def get_subscription(
    subscription_id: UUID,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    sub = await db.scalar(
        select(Subscription).where(
            Subscription.id == subscription_id,
            Subscription.merchant_id == merchant.id,
        )
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    response = SubscriptionResponse.model_validate(sub)

    # Include active virtual account if subscription is still pending
    if sub.status == SubscriptionStatus.pending_payment:
        va = await db.scalar(
            select(VirtualAccount).where(
                VirtualAccount.subscription_id == sub.id,
                VirtualAccount.is_active == True,
            )
        )
        if va:
            response.virtual_account = VirtualAccountInfo.model_validate(va)

    return response


@router.get("/subscriptions", response_model=list[SubscriptionResponse])
async def list_subscriptions(
    status_filter: SubscriptionStatus | None = Query(None, alias="status"),
    customer_id: UUID | None = Query(None),
    plan_id: UUID | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    query = select(Subscription).where(Subscription.merchant_id == merchant.id)

    if status_filter:
        query = query.where(Subscription.status == status_filter)
    if customer_id:
        query = query.where(Subscription.customer_id == customer_id)
    if plan_id:
        query = query.where(Subscription.plan_id == plan_id)

    query = query.order_by(Subscription.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    return [SubscriptionResponse.model_validate(s) for s in result.scalars().all()]


@router.post("/subscriptions/{subscription_id}/cancel", response_model=SubscriptionResponse)
async def cancel_subscription(
    subscription_id: UUID,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    sub = await db.scalar(
        select(Subscription).where(
            Subscription.id == subscription_id,
            Subscription.merchant_id == merchant.id,
        )
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if sub.status == SubscriptionStatus.cancelled:
        raise HTTPException(status_code=400, detail="Subscription is already cancelled")

    sub.status = SubscriptionStatus.cancelled

    # Deactivate any live virtual accounts for this subscription
    vas = await db.execute(
        select(VirtualAccount).where(
            VirtualAccount.subscription_id == sub.id,
            VirtualAccount.is_active == True,
        )
    )
    for va in vas.scalars().all():
        va.is_active = False

    await db.commit()
    await db.refresh(sub)

    # TODO: Fire subscription.cancelled webhook to merchant (Phase 1 webhook step)
    return SubscriptionResponse.model_validate(sub)
