# app/schemas/plan.py

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, field_validator
from app.models.plan import PlanInterval


class PlanCreate(BaseModel):
    name: str
    amount: int          # In kobo — e.g. 500000 = ₦5,000
    currency: str = "NGN"
    interval: PlanInterval

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Amount must be greater than 0 kobo")
        return v


class PlanResponse(BaseModel):
    id: UUID
    merchant_id: UUID
    name: str
    amount: int          # Still in kobo — let the frontend format it
    currency: str
    interval: PlanInterval
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
