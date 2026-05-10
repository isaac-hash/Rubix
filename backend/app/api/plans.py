# app/api/plans.py
# ─────────────────────────────────────────────────────────────────────────────
# Plan endpoints — merchants define their pricing tiers here.
# Plans are merchant-scoped: merchant A cannot see or modify merchant B's plans.
# ─────────────────────────────────────────────────────────────────────────────

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.dependencies import get_current_merchant
from app.models.merchant import Merchant
from app.models.plan import Plan
from app.schemas.plan import PlanCreate, PlanResponse

router = APIRouter()


@router.post("/plans", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def create_plan(
    body: PlanCreate,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    plan = Plan(
        merchant_id=merchant.id,
        name=body.name,
        amount=body.amount,
        currency=body.currency,
        interval=body.interval,
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return PlanResponse.model_validate(plan)


@router.get("/plans", response_model=list[PlanResponse])
async def list_plans(
    is_active: bool | None = Query(None, description="Filter by active status"),
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    """List all plans for this merchant, with optional active/inactive filter."""
    query = select(Plan).where(Plan.merchant_id == merchant.id)
    if is_active is not None:
        query = query.where(Plan.is_active == is_active)

    result = await db.execute(query)
    return [PlanResponse.model_validate(p) for p in result.scalars().all()]


@router.patch("/plans/{plan_id}/archive", response_model=PlanResponse)
async def archive_plan(
    plan_id: UUID,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    """
    Archive (soft-delete) a plan. Plans with active subscriptions can be
    archived — existing subscribers are unaffected, new subscribers cannot
    choose this plan.
    We never hard-delete plans because payments reference them historically.
    """
    plan = await db.scalar(
        select(Plan).where(Plan.id == plan_id, Plan.merchant_id == merchant.id)
    )
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    plan.is_active = False
    await db.commit()
    await db.refresh(plan)
    return PlanResponse.model_validate(plan)
